/**
 * Configuration options for the DependencyMonitor.
 * For information on how cache duration and refresh threshold work together, see [cache-manager](https://github.com/jaredwray/cacheable/tree/main/packages/cache-manager#options)
 * @typedef {Object} DependencyMonitorOptions
 * @example
 * // monitor with default options
 * const monitor = new DependencyMonitor();
 * @example
 * // monitor with custom options
 * const options: DependencyMonitorOptions = {
 *   cacheDurationMs: 30000, // override cache duration of 30 seconds
 *   refreshThresholdMs: 2000, // override refresh threshold of 2 seconds
 *   checkIntervalMs: 10000, // override check interval of 10 seconds
 * };
 * const monitor = new DependencyMonitor(options);
 *
 * monitor.startDependencyCheckInterval();
 */
export type DependencyMonitorOptions = {
  /**
   * Optional cache duration in milliseconds.
   * @default 60000
   */
  cacheDurationMs?: number;
  /**
   * Optional refresh threshold in milliseconds.
   * @default 5000
   */
  refreshThresholdMs?: number;
  /**
   * Optional interval for running dependency checks in milliseconds.
   * @default 15000
   */
  checkIntervalMs?: number;
  /**
   * Optional prom-client module instance override to use for metrics. If not provided, the default
   * installed prom-client dependency is used. Metrics are always enabled; an error is thrown if
   * prom-client cannot be loaded.
   */
  promClient?: any;
  /**
   * Optional existing Registry instance to register metrics with. If omitted a new Registry is created.
   */
  registry?: any;
  /**
   * When true and a new Registry is created internally, default process metrics will also be collected.
   */
  collectDefaultMetrics?: boolean;
};
