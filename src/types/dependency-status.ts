/**
 * Represents the status of a dependency.
 * @typedef {Object} DependencyStatus
 * @property {string} name - The name of the dependency.
 * @property {string} description - Description of the dependency.
 * @property {string} impact - Impact of the dependency on the system.
 * @property {boolean} healthy - Indicates whether the dependency is healthy.
 * @property {number} code - Status code (e.g., SUCCESS_STATUS_CODE (0), ERROR_STATUS_CODE (1), WARNING_STATUS_CODE (2)).
 * @property {string} status - Status message (e.g., SUCCESS_STATUS_MESSAGE, ERROR_STATUS_MESSAGE, WARNING_STATUS_MESSAGE).
 * @property {number} latencyMs - The latency of the dependency check in milliseconds.
 * @property {string} lastChecked - The ISO timestamp of the last check.
 * @property {Object} [error] - If the check fails, this contains the error object.
 * @property {string} [error.name] - The name of the error.
 * @property {string} [error.message] - The error message.
 * @property {string} [error.stack] - The stack trace of the error.
 * @property {string} [errorMessage] - Optional error message if the check fails.
 * @example
 * const dependencyStatus: DependencyStatus = monitor.getStatus('Some Database');
 * console.log(dependencyStatus);
 * // Output:
 * // {
 * //   name: 'Some Database',
 * //   description: 'Database connection check',
 * //   impact: 'Database data will be unavailable.',
 * //   healthy: true,
 * //   code: 0,
 * //   status: 'OK',
 * //   latencyMs: 50,
 * //   lastChecked: '2023-10-01T12:00:00Z',
 * // }
 */
export type DependencyStatus = {
  name: string;
  description: string;
  impact: string;
  healthy: boolean;
  code: number;
  status: string;
  latencyMs: number;
  lastChecked: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  errorMessage?: string;
};
