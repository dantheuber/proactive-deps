import { DependencyCheckOptions } from './dependency-check-options';
import { DependencyStatus } from './dependency-status';
/**
 * An interface defining the structure of the dependency monitor class.
 * It includes properties and methods for managing the monitoring of dependencies.
 * @interface DependencyMonitorInterface
 */
export interface DependencyMonitorInterface {
  /**
   * A flag indicating whether the check interval has started.
   * @example
   * const monitor = new DependencyMonitor();
   * console.log(monitor.checkIntervalStarted); // false
   * monitor.startDependencyCheckInterval();
   * console.log(monitor.checkIntervalStarted); // true
   */
  checkIntervalStarted: boolean;
  /**
   * Starts the interval for checking dependencies.
   * @returns {void}
   * @example
   * monitor.startDependencyCheckInterval();
   */
  startDependencyCheckInterval(): void;
  /**
   * Stops the interval for checking dependencies.
   * @example
   * monitor.startDependencyCheckInterval();
   */
  stopDependencyCheckInterval(): void;
  /**
   * Registers a new dependency to be monitored.
   * @param {DependencyCheckOptions} dependency - The dependency to register.
   * @example
   * monitor.register({
   *   name: 'Database',
   *   description: 'Database connection check',
   *   impact: 'Database data will be unavailable.',
   *   check: async () => {
   *     // Perform some check (e.g., ping a database)
   *     return SUCCESS_STATUS_CODE;
   *   },
   * });
   */
  register(dependency: DependencyCheckOptions): void;
  /**
   * Retrieves the statuses of all registered dependencies.
   * @returns {Promise<DependencyStatus[]>} - A promise that resolves to an array of dependency statuses.
   * @example
   * const statuses = await monitor.getAllStatuses();
   * console.log(statuses);
   * // Output:
   * // [
   * //   { name: 'Database', healthy: true, code: 0, status: 'OK', ... },
   * //   { name: 'API', healthy: false, code: 1, status: 'ERROR', ... },
   * // ]
   */
  getAllStatuses(): Promise<DependencyStatus[]>;
  /**
   * Retrieves the status of a specific dependency by name.
   * @param {string} dependencyName - The name of the dependency to check.
   * @returns {Promise<DependencyStatus>} - A promise that resolves to the status of the specified dependency.
   * @example
   * const status = await monitor.getStatus('Database');
   * console.log(status);
   * // Output:
   * // { name: 'Database', healthy: true, code: 0, status: 'OK', ... }
   */
  getStatus(dependencyName: string): Promise<DependencyStatus>;
  /**
   * Retrieves the Prometheus metrics for all dependencies.
   * @returns {Promise<string>} - A promise that resolves to a string containing the Prometheus metrics.
   * @example
   * const prometheusMetrics = await monitor.getPrometheusMetrics();
   * console.log(prometheusMetrics);
   * // Output:
   * // # HELP dependency_health The status of the database connection (0 = Healthy, 1 = Unhealthy)
   * // # TYPE dependency_health gauge
   * // dependency_health{dependency="Database", impact="Database info will not be available."} 0
   * // # HELP dependency_latency The latency of the database connection check
   * // # TYPE dependency_latency gauge
   * // dependency_latency{dependency="Database"} 50
   */
  getPrometheusMetrics(): Promise<string>;
  /**
   * Returns the underlying prom-client Registry used for metrics.
   * Metrics are always enabled; this method never returns undefined.
   */
  getPrometheusRegistry(): any;
}
