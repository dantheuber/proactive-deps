import { createCache, Cache as CacheManagerCache } from 'cache-manager';
import promClient from 'prom-client';
import {
  DEFAULT_CHECK_INTERVAL_MS,
  DEFAULT_CACHE_DURATION_MS,
  DEFAULT_REFRESH_THRESHOLD_MS,
  ERROR_STATUS_CODE,
  SUCCESS_STATUS_CODE,
} from './constants';
import {
  DependencyMonitorInterface,
  DependencyMonitorOptions,
  DependencyCheckOptions,
  DependencyStatus,
} from './types';
import formatCheckResult from './lib/format-check-result';

// Prometheus support is optional; we lazy-require prom-client only if metrics are requested
// Using loose any typing to avoid forcing downstream consumers to install @types/prom-client
type PromClientModule = any;

/**
 * DependencyMonitor is a class that monitors the status of various dependencies
 * (e.g., databases, APIs) and provides methods to check their health and latency.
 * It uses a cache to store the results of the checks and can be configured
 * to refresh the cache at specified intervals.
 * It also provides a method to get Prometheus metrics for the monitored dependencies.
 * @class DependencyMonitor
 */
class DependencyMonitor implements DependencyMonitorInterface {
  private _dependencies: DependencyCheckOptions[] = [];
  private _cache: CacheManagerCache;
  private _dependencyCheckInterval: NodeJS.Timeout | null = null;
  private _refreshThresholdMs: number = DEFAULT_REFRESH_THRESHOLD_MS;
  private _cacheDurationMs: number = DEFAULT_CACHE_DURATION_MS;
  private _checkIntervalMs: number = DEFAULT_CHECK_INTERVAL_MS;
  // prom-client related (all optional / lazy)
  private _promClient: PromClientModule;
  private _registry: any; // use any to avoid requiring prom-client types for consumers
  private _latencyGauge?: any;
  private _healthGauge?: any;
  private _metricsInitialized = false;
  private _collectDefaultMetrics = false;

  public checkIntervalStarted: boolean = false;

  /**
   * Creates an instance of DependencyMonitor.
   * @param {DependencyMonitorOptions} [options] - Optional configuration options for the monitor.
   * @default { cacheDurationMs: 60000, refreshThresholdMs: 5000, checkIntervalMs: 15000 }
   * @example
   * const monitor = new DependencyMonitor({
   *   cacheDurationMs: 60000, // Cache duration of 1 minute
   *   refreshThresholdMs: 5000, // Refresh threshold of 5 seconds
   *   checkIntervalMs: 15000, // Check interval of 15 seconds
   * });
   */
  constructor(options: DependencyMonitorOptions = {}) {
    this._cacheDurationMs =
      options.cacheDurationMs || DEFAULT_CACHE_DURATION_MS;
    this._refreshThresholdMs =
      options.refreshThresholdMs || DEFAULT_REFRESH_THRESHOLD_MS;
    this._checkIntervalMs =
      options.checkIntervalMs || DEFAULT_CHECK_INTERVAL_MS;

    this._cache = createCache({
      ttl: this._cacheDurationMs,
      refreshThreshold: this._refreshThresholdMs,
    });

  // store prometheus options and eagerly ensure prom-client presence
  this._promClient = options.promClient || promClient;
  this._registry = options.registry; // may be undefined; created during _initPromClient
  this._collectDefaultMetrics = !!options.collectDefaultMetrics;
  // Eagerly initialize metrics so they are always available
  this._initPromClient();
  }

  public startDependencyCheckInterval(): void {
    this.checkIntervalStarted = true;
    if (this._dependencyCheckInterval) {
      clearInterval(this._dependencyCheckInterval);
    }
    this._getAllDependenciesStatus(); // Initial check
    this._dependencyCheckInterval = setInterval(
      this._getAllDependenciesStatus.bind(this),
      this._checkIntervalMs,
    );
    this._dependencyCheckInterval.unref(); // Allow the process to exit if this is the only thing running
  }

  public stopDependencyCheckInterval(): void {
    this.checkIntervalStarted = false;
    if (this._dependencyCheckInterval) {
      clearInterval(this._dependencyCheckInterval);
      this._dependencyCheckInterval = null;
    }
  }

  public register(dependency: DependencyCheckOptions): void {
    this._dependencies.push(dependency);
  }

  private async _getDependencyStatus(
    dependency: DependencyCheckOptions,
  ): Promise<DependencyStatus> {
    try {
      return await this._cache.wrap(
        dependency.name,
        async () => {
          if (dependency.skip) {
            return formatCheckResult(dependency, SUCCESS_STATUS_CODE, 0, true);
          }
          const start = Date.now();
          const checkResults = await dependency.check();
          const latencyMs = Date.now() - start;
          const status = formatCheckResult(
            dependency,
            checkResults,
            latencyMs,
          );
          this._updateMetrics(status);
            return status;
        },
        dependency.cacheDurationMs || this._cacheDurationMs,
        dependency.refreshThresholdMs || this._refreshThresholdMs,
      );
    } catch (error) {
      const status = formatCheckResult(dependency, {
        code: ERROR_STATUS_CODE,
        error: error as Error,
        errorMessage: `Error checking dependency ${dependency.name}`,
      });
      await this._cache.set(
        dependency.name,
        status,
        dependency.cacheDurationMs,
      );
      this._updateMetrics(status);
      return status;
    }
  }

  private async _getAllDependenciesStatus(): Promise<DependencyStatus[]> {
    const checkPromises = this._dependencies.map(async (dep) =>
      this._getDependencyStatus(dep),
    );

    // Run all checks concurrently
    return await Promise.all(checkPromises);
  }

  public async getStatus(dependencyName: string): Promise<DependencyStatus> {
    const cacheKey = dependencyName;
    const cachedValue = await this._cache.get(cacheKey);
    if (cachedValue) {
      return cachedValue as DependencyStatus;
    } else {
      const dependency = this._dependencies.find(
        (dep) => dep.name === dependencyName,
      );
      if (dependency) {
        return await this._getDependencyStatus(dependency);
      }
      throw new Error(`Dependency ${dependencyName} not found`);
    }
  }

  public async getAllStatuses(): Promise<DependencyStatus[]> {
    return await this._getAllDependenciesStatus();
  }

  public async getPrometheusMetrics(): Promise<string> {
    await this._getAllDependenciesStatus(); // ensure gauges updated before render
    this._initPromClient();
    return this._registry.metrics();
  }

  /**
   * Returns the underlying prom-client Registry if initialized.
   */
  public getPrometheusRegistry() {
    this._initPromClient();
    return this._registry;
  }

  private _initPromClient(): boolean {
    if (this._metricsInitialized) return true;
    if (!this._registry) {
      this._registry = new this._promClient.Registry();
      if (this._collectDefaultMetrics) {
        this._promClient.collectDefaultMetrics({
          register: this._registry,
        });
      }
    }

    const latencyName = 'dependency_latency_ms';
    const healthName = 'dependency_health';

    const existingLatency = this._registry.getSingleMetric(latencyName);
    this._latencyGauge =
      existingLatency ||
      new this._promClient.Gauge({
        name: latencyName,
        help: 'Last dependency check latency in milliseconds',
        labelNames: ['dependency'],
        registers: [this._registry],
      });

    const existingHealth = this._registry.getSingleMetric(healthName);
    this._healthGauge =
      existingHealth ||
      new this._promClient.Gauge({
        name: healthName,
        help: 'Dependency health status (0=OK,1=WARNING,2=CRITICAL)',
        labelNames: ['dependency', 'impact'],
        registers: [this._registry],
      });

    this._metricsInitialized = true;
    return true;
  }

  private _updateMetrics(status: DependencyStatus) {
    this._initPromClient();
    const { name, impact, health } = status;
    const valueMap: Record<string, number> = { OK: 0, WARNING: 1, CRITICAL: 2 };
    const value = valueMap[health.state];
    this._latencyGauge!.set({ dependency: name }, health.latency);
    this._healthGauge!.set({ dependency: name, impact: impact || '' }, value);
  }
}

export { DependencyMonitor };
