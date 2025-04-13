/**
 * Configuration options for the DependencyMonitor.
 * For information on how cache duration and refresh threshold work together, see [cache-manager](https://github.com/jaredwray/cacheable/tree/main/packages/cache-manager#options)
 * @typedef {Object} DependencyMonitorOptions
 * @property {number} [cacheDurationMs] - Optional cache duration in milliseconds. Defaults to 1 minute.
 * @property {number} [refreshThresholdMs] - Optional refresh threshold in milliseconds. Defaults to 5 seconds.
 * @property {number} [checkIntervalMs] - Optional interval for running dependency checks in milliseconds. Defaults to 15 seconds.
 * @example
 * // monitor with default options
 * const monitor = new DependencyMonitor();
 * @example
 * // monitor with custom options
 * const monitor = new DependencyMonitor({
 *   cacheDurationMs: 60000, // Cache duration of 1 minute
 *   refreshThresholdMs: 5000, // Refresh threshold of 5 seconds
 *   checkIntervalMs: 15000, // Check interval of 15 seconds
 * });
 *
 * monitor.startDependencyCheckInterval();
 */
export type DependencyMonitorOptions = {
  cacheDurationMs?: number;
  refreshThresholdMs?: number;
  checkIntervalMs?: number;
};
