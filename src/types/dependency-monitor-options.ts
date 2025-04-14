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
};
