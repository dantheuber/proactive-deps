/**
 * An async function that performs a dependency check.
 * @typedef {function(): Promise<DependencyCheckResult>} DependencyCheckFunction
 * @returns {Promise<DependencyCheckResult>} The result of the dependency check.
 * @example
 * import { SUCCESS_STATUS_CODE, ERROR_STATUS_CODE } from 'proactive-deps';
 * const checkDatabaseConnection = async () => {
 *   // Perform the check (e.g., ping the database)
 *   const isConnected = await database.ping();
 *   return isConnected ?
 *    SUCCESS_STATUS_CODE :
 *    { code: ERROR_STATUS_CODE, errorMessage: 'Database not reachable' };
 * };
 */
import { DependencyCheckResult } from './dependency-check-result';
export type DependencyCheckFunction = () => Promise<DependencyCheckResult>;
