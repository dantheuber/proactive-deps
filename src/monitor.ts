import { createCache, Cache as CacheManagerCache } from 'cache-manager';
import {
  DEFAULT_CHECK_INTERVAL_MS,
  DEFAULT_CACHE_DURATION_MS,
  DEFAULT_REFRESH_THRESHOLD_MS,
  ERROR_STATUS_CODE,
} from './constants';
import {
  DependencyMonitorInterface,
  DependencyMonitorOptions,
  DependencyCheckOptions,
  DependencyStatus,
} from './types';
import formatCheckResult from './lib/format-check-result';
import formatPrometheusMetrics from './lib/format-prometheus-metrics';

/**
 * DependencyMonitor is a class that monitors the status of various dependencies
 * (e.g., databases, APIs) and provides methods to check their health and latency.
 * It uses a cache to store the results of the checks and can be configured
 * to refresh the cache at specified intervals.
 * It also provides a method to get Prometheus metrics for the monitored dependencies.
 * @class DependencyMonitor
 * @implements {DependencyMonitorInterface}
 * @param {DependencyMonitorOptions} [options] - Optional configuration options for the monitor.
 * @param {number} [options.cacheDurationMs] - Duration (in milliseconds) to cache the dependency check result.
 * @param {number} [options.refreshThresholdMs] - Duration (in milliseconds) to refresh the dependency check result.
 * @param {number} [options.checkIntervalMs] - Interval (in milliseconds) for running dependency checks.
 * @example
 * const monitor = new DependencyMonitor({
 *   cacheDurationMs: 60000, // Cache duration of 1 minute
 *   refreshThresholdMs: 5000, // Refresh threshold of 5 seconds
 *   checkIntervalMs: 15000, // Check interval of 15 seconds
 * });
 */
class DependencyMonitor implements DependencyMonitorInterface {
  private _dependencies: DependencyCheckOptions[] = [];
  private _cache: CacheManagerCache;
  private _dependencyCheckInterval: NodeJS.Timeout | null = null;
  private _refreshThresholdMs: number = DEFAULT_REFRESH_THRESHOLD_MS;
  private _cacheDurationMs: number = DEFAULT_CACHE_DURATION_MS;
  private _checkIntervalMs: number = DEFAULT_CHECK_INTERVAL_MS;

  public checkIntervalStarted: boolean = false;

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
          const start = Date.now();
          const checkResults = await dependency.check();
          const latencyMs = Date.now() - start;
          return formatCheckResult(dependency, checkResults, latencyMs);
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
    const statuses = await this._getAllDependenciesStatus();
    return formatPrometheusMetrics(statuses);
  }
}

export { DependencyMonitor };
