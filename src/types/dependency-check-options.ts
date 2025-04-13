/**
 * Represents a dependency to be monitored.
 * @typedef {Object} DependencyCheckOptions
 * @property {string} name - The name of the dependency.
 * @property {string} description - A description of the dependency.
 * @property {string} impact - The impact of the dependency on the system, should it go down.
 * @property {DependencyCheckFunction} check - A function that performs the dependency check and returns a result.
 * @property {number} [cacheDurationMs] - Optional override duration (in milliseconds) to cache the dependency check result.
 * @property {number} [refreshThresholdMs] - Optional override duration (in milliseconds) to refresh the dependency check result.
 * @example
 * const monitor = new DependencyMonitor();
 *
 * monitor.register({
 *   name: 'Some Database',
 *   description: 'Database connection check',
 *   impact: 'Database data will be unavailable.',
 *   cacheDurationMs: 30000, // override cache duration to 30 seconds
 *   refreshThresholdMs: 10000, // override refresh threshold to 10 seconds
 *   check: async () => {
 *    // Perform some check (e.g., ping a database)
 *    return SUCCESS_STATUS_CODE;
 *   },
 * });
 */
import { DependencyCheckResult } from './dependency-check-result';
export type DependencyCheckOptions = {
  name: string;
  description: string;
  impact: string;
  check: () => Promise<DependencyCheckResult>;
  cacheDurationMs?: number;
  refreshThresholdMs?: number;
};
