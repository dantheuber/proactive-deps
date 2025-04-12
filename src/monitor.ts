import { createCache, Cache as CacheManagerCache } from 'cache-manager';
import {
  DEPENDENCY_CHECK_INTERVAL_MS,
  DEFAULT_CACHE_DURATION_MS,
  DEFAULT_CHECK_TIMEOUT_MS,
  DEFAULT_REFRESH_THRESHOLD_MS,
  ERROR_STATUS_CODE,
} from './constants';
import { DependencyCheck, DependencyMonitorOptions, DependencyStatus } from './types';
import formatCheckResult from './lib/format-check-result';
import formatPrometheusMetrics from './lib/format-prometheus-metrics';

/**
 * A class to monitor the health of dependencies and cache their statuses.
 */
class DependencyMonitor {
  private dependencies: DependencyCheck[] = [];
  private cache: CacheManagerCache;
  private dependencyCheckInterval: NodeJS.Timeout | null = null;
  private checkTimeoutMs: number = DEFAULT_CHECK_TIMEOUT_MS;
  private refreshThresholdMs: number = DEFAULT_REFRESH_THRESHOLD_MS;
  private cacheDurationMs: number = DEFAULT_CACHE_DURATION_MS;
  private checkIntervalMs: number = DEPENDENCY_CHECK_INTERVAL_MS;

  /**
   * Creates an instance of DependencyMonitor.
   * @param {DependencyMonitorOptions} [options] - Configuration options for the monitor.
   */
  constructor(options: DependencyMonitorOptions = {}) {
    this.checkTimeoutMs = options.checkTimeoutMs || DEFAULT_CHECK_TIMEOUT_MS;
    this.cacheDurationMs = options.cacheDurationMs || DEFAULT_CACHE_DURATION_MS;
    this.refreshThresholdMs = options.refreshThresholdMs || DEFAULT_REFRESH_THRESHOLD_MS;
    this.checkIntervalMs = options.checkIntervalMs || DEPENDENCY_CHECK_INTERVAL_MS;

    this.cache = createCache({
      ttl: this.cacheDurationMs,
      refreshThreshold: this.refreshThresholdMs,
    });

    this.startDependencyCheckInterval();
  }

  /**
   * Starts the interval to periodically check the status of all dependencies.
   * @private
   */
  private startDependencyCheckInterval(): void {
    if (this.dependencyCheckInterval) {
      clearInterval(this.dependencyCheckInterval);
    }
    this.dependencyCheckInterval = setInterval(this.getAllDependenciesStatus.bind(this), this.checkIntervalMs);
  }

  /**
   * Stops the interval that checks the status of all dependencies.
   * @private
   */
  private stopDependencyCheckInterval(): void {
    if (this.dependencyCheckInterval) {
      clearInterval(this.dependencyCheckInterval);
      this.dependencyCheckInterval = null;
    }
  }

  /**
   * Registers a new dependency to be monitored.
   * @param {DependencyCheck} dependency - The dependency to register.
   */
  public register(dependency: DependencyCheck): void {
    this.dependencies.push(dependency);
  }

  /**
   * Gets the status of a single dependency, using the cache if available.
   * @private
   * @param {DependencyCheck} dependency - The dependency to check.
   * @returns {Promise<DependencyStatus>} The status of the dependency.
   */
  private async getDependencyStatus(dependency: DependencyCheck): Promise<DependencyStatus> {
    try {
      return await this.cache.wrap(dependency.name, async () => {
        const start = Date.now();
        const checkResults = await dependency.check();
        const latencyMs = Date.now() - start;
        return formatCheckResult(dependency.name, checkResults, latencyMs, );
      }, { ttl: dependency.cacheDurationMs });
    } catch (error) {
      const status = formatCheckResult(
        dependency.name,
        {
          code: ERROR_STATUS_CODE,
          error: error as Error,
          errorMessage: `Error checking dependency ${dependency.name}`,
        }
      );
      await this.cache.set(
        dependency.name,
        status,
        dependency.cacheDurationMs,
      );
      return status;
    }
  }

  /**
   * Gets the status of all registered dependencies concurrently.
   * @private
   * @returns {Promise<DependencyStatus[]>} An array of dependency statuses.
   */
  private async getAllDependenciesStatus(): Promise<DependencyStatus[]> {
    const checkPromises = this.dependencies.map(async (dep) => this.getDependencyStatus(dep));

    // Run all checks concurrently
    return await Promise.all(checkPromises);
  }

  /**
   * Gets the status of a specific dependency by name.
   * @param {string} dependencyName - The name of the dependency.
   * @returns {Promise<any>} The status of the dependency.
   * @throws {Error} If the dependency is not found.
   */
  public async getStatus(dependencyName: string): Promise<any> {
    const cacheKey = dependencyName;
    const cachedValue = await this.cache.get(cacheKey);
    if (cachedValue) {
      return cachedValue;
    } else {
      const dependency = this.dependencies.find((dep) => dep.name === dependencyName);
      if (dependency) {
        return await this.getDependencyStatus(dependency);
      }
      throw new Error(`Dependency ${dependencyName} not found`);
    }
  }

  /**
   * Gets the status of all registered dependencies.
   * @returns {Promise<DependencyStatus[]>} An array of dependency statuses.
   */
  public async getAllStatuses(): Promise<DependencyStatus[]> {
    return await this.getAllDependenciesStatus();
  }

  
  /**
   * Retrieves Prometheus-formatted metrics for all dependencies.
   *
   * This method fetches the status of all dependencies and generates
   * Prometheus metrics strings for each dependency, including:
   * - `dependency_latency_ms`: The latency of the dependency in milliseconds.
   * - `dependency_health`: A binary value indicating the health of the dependency (1 for healthy, 0 for unhealthy).
   *
   * @returns A promise that resolves to a string containing Prometheus metrics
   *          for all dependencies, formatted as required by Prometheus.
   */
  public async getPrometheusMetrics(): Promise<string> {
    const statuses = await this.getAllDependenciesStatus();
    return formatPrometheusMetrics(statuses);
  }
}

export {
  DependencyMonitor,
};