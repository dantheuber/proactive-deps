import {
  GenericCheckDetails,
  DatabaseCheckDetails,
  RestCheckDetails,
  SoapCheckDetails,
} from './check-detail-types';
import { DependencyCheckResult } from './dependency-check-result';
/**
 * Configuration options defining a dependency to be monitored.
 * @interface DependencyCheckOptions
 * @example
 * const monitor = new DependencyMonitor();
 *
 * const myDependency: DependencyCheckOptions = {
 *   name: 'Some Database',
 *   description: 'Database connection check',
 *   impact: 'Database data will be unavailable.',
 *   skip: process.env.NODE_ENV === 'dev', // skip in dev environment
 *   contact: {
 *     team: 'Dev Team',
 *     slack: '#dev-team-channel',
 *   },
 *   cacheDurationMs: 30000, // override cache duration to 30 seconds
 *   refreshThresholdMs: 10000, // override refresh threshold to 10 seconds
 *   check: async () => {
 *     // Perform some check (e.g., ping a database)
 *     return SUCCESS_STATUS_CODE;
 *   },
 *   checkDetails: {
 *     type: 'database',
 *     server: 'localhost',
 *     database: 'mydb',
 *     dbType: 'mysql',
 *   }
 * };
 *
 * monitor.register(myDependency);
 */
export interface DependencyCheckOptions {
  /**
   * The name of the dependency.
   * @example
   * const myDependency: DependencyCheckOptions = {
   *   name: 'Very Important Database',
   *   ...
   * };
   */
  name: string;
  /**
   * A description of the dependency.
   * @example
   * const myDependency: DependencyCheckOptions = {
   *   ...
   *   description: 'Database used for very important data.',
   * };
   */
  description: string;
  /**
   * The impact of the dependency on the system, should it go down.
   * @example
   * const myDependency: DependencyCheckOptions = {
   *   ...
   *   impact: 'Important data will not be available and specific things wont work.',
   * };
   */
  impact: string;
  /**
   * Optional flag to skip the check. Useful for skipping checks in some environments.
   * @default false
   * @example
   * const myDependency: DependencyCheckOptions = {
   *   ...
   *   skip: process.env.NODE_ENV === 'dev', // skip in dev environment
   * };
   */
  skip?: boolean;
  /**
   * Optional contact information for the dependency. Can contain any number of custom properties.
   * @example
   * const myDependency: DependencyCheckOptions = {
   *   ...
   *   contact: {
   *     team: 'Dev Team',
   *     slack: '#dev-team-channel',
   *   },
   * };
   */
  contact?: {
    [key: string]: string;
  };
  /**
   * A function that performs the dependency check and returns a result.
   * @returns {Promise<DependencyCheckResult>} - A promise that resolves to the result of the check.
   * @example
   * const myDependency: DependencyCheckOptions = {
   *   ...
   *   check: async () => {
   *     // Perform the check (e.g., ping the database)
   *     try {
   *       await database.ping();
   *       return SUCCESS_STATUS_CODE;
   *     } catch (error) {
   *       return {
   *         code: ERROR_STATUS_CODE,
   *         error: error,
   *         errorMessage: 'Database not reachable',
   *       };
   *     }
   *   };
   * };
   */
  check(): Promise<DependencyCheckResult>;
  /**
   * Optional details about what is being checked, and how.
   * @example
   * const checkDetails: DatabaseCheckDetails = {
   *   type: 'database',
   *   server: 'localhost',
   *   database: 'mydb',
   *   dbType: 'mysql',
   * };
   * const myDependency: DependencyCheckOptions = {
   *   ...
   *   checkDetails,
   * };
   */
  checkDetails?:
    | GenericCheckDetails
    | DatabaseCheckDetails
    | RestCheckDetails
    | SoapCheckDetails;
  /**
   * Optional override duration (in milliseconds) to cache this dependency checks result.
   * @example
   * const myDependency: DependencyCheckOptions = {
   *   ...
   *   cacheDurationMs: 30000, // override cache duration to 30 seconds
   * };
   */
  cacheDurationMs?: number;
  /**
   * Optional override duration (in milliseconds) to refresh this dependency checks result.
   * @example
   * const myDependency: DependencyCheckOptions = {
   *   ...
   *   refreshThresholdMs: 10000, // override refresh threshold to 10 seconds
   * };
   */
  refreshThresholdMs?: number;
}
