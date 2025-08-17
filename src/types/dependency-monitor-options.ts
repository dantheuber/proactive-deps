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
   * Optional prom-client module instance to use for metrics. If not provided the library will attempt
   * to lazy-load prom-client. If prom-client cannot be resolved, metrics collection becomes a no-op
   * and `getPrometheusMetrics` will return an empty string.
   * @example
   * import * as promClient from 'prom-client';
   * const monitor = new DependencyMonitor({ promClient });
   */
  promClient?: any; // typed as any to avoid hard dependency on prom-client types at compile for consumers not using it
  /**
   * Optional existing Registry instance to register metrics with. If omitted a new Registry is created.
   */
  registry?: any;
  /**
   * When true and a new Registry is created internally, default process metrics will also be collected.
   */
  collectDefaultMetrics?: boolean;
};
