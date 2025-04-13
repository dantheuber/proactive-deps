/**
 * The result of a dependency check.
 * Can be either a number (status code) or an object containing error details.
 * @typedef {number | Object} DependencyCheckResult
 * @property {number} code - The status code of the check.
 * @property {Error} [error] - The error object if the check fails.
 * @property {string} [errorMessage] - Optional error message if the check fails.
 * @example
 * import { SUCCESS_STATUS_CODE, ERROR_STATUS_CODE } from 'proactive-deps';
 * const checkDatabaseConnection = async () => {
 *   // Perform the check (e.g., ping the database)
 *   try {
 *     await database.ping();
 *     return SUCCESS_STATUS_CODE;
 *   } catch (error) {
 *     return {
 *       code: ERROR_STATUS_CODE,
 *       error: error,
 *       errorMessage: 'Database not reachable',
 *     };
 *   }
 * };
 */
export type DependencyCheckResult =
  | number
  | {
      code: number;
      error?: Error;
      errorMessage?: string;
    };
