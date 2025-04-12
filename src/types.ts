/**
 * Represents the status of a dependency.
 * @typedef {Object} DependencyStatus
 * @property {string} name - The name of the dependency.
 * @property {boolean} healthy - Indicates whether the dependency is healthy.
 * @property {number} code - Status code (e.g., SUCCESS_STATUS_CODE, ERROR_STATUS_CODE, WARNING_STATUS_CODE).
 * @property {string} message - Status message (e.g., SUCCESS_STATUS_MESSAGE, ERROR_STATUS_MESSAGE, WARNING_STATUS_MESSAGE).
 * @property {Error} [error] - Optional error object if the check fails.
 * @property {string} [errorMessage] - Optional error message if the check fails.
 * @property {number} latencyMs - The latency of the dependency check in milliseconds.
 */
export type DependencyStatus = {
  name: string;
  healthy: boolean;
  code: number;
  message: string;
  error?: Error;
  errorMessage?: string;
  latencyMs: number;
};
/**
 * Represents the result of a dependency check function.
 * @typedef {Object} DependencyCheckResult
 * @property {number} code - Status code (e.g., SUCCESS_STATUS_CODE, ERROR_STATUS_CODE, WARNING_STATUS_CODE).
 * @property {Error} [error] - Optional error object if the check fails.
 * @property {string} [errorMessage] - Optional error message if the check fails.
 */
export type DependencyCheckResult = {
  code: number;
  error?: Error;
  errorMessage?: string;
};
/**
 * Represents a dependency to be monitored.
 * @typedef {Object} DependencyCheck
 * @property {string} name - The name of the dependency.
 * @property {string} description - A description of the dependency.
 * @property {function<Promise<DependencyCheckResult>>} check - A function that performs the dependency check and returns a result.
 * @property {number} cacheDurationMs - The duration (in milliseconds) to cache the dependency check result.
 */
export type DependencyCheck = {
  name: string;
  description: string;
  check: () => Promise<DependencyCheckResult>;
  cacheDurationMs: number;
};
/**
 * Configuration options for the DependencyMonitor.
 * @typedef {Object} DependencyMonitorOptions
 * @property {number} [cacheDurationMs] - Cache duration in milliseconds.
 * @property {number} [checkTimeoutMs] - Timeout for the check in milliseconds.
 * @property {number} [refreshThresholdMs] - Refresh threshold in milliseconds.
 * @property {number} [checkIntervalMs] - Interval for running dependency checks in milliseconds.
 */
export type DependencyMonitorOptions = {
  cacheDurationMs?: number;
  checkTimeoutMs?: number;
  refreshThresholdMs?: number;
  checkIntervalMs?: number;
};
