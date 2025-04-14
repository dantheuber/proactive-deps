/**
 * Represents a dependency to be monitored.
 * @typedef {Object} DependencyCheckOptions
 * @property {string} name - The name of the dependency.
 * @property {string} description - A description of the dependency.
 * @property {string} impact - The impact of the dependency on the system, should it go down.
 * @property {boolean} [skip] - Optional flag to skip the check. Useful for skipping checks in some environments.
 * @property {Object} [contact] - Optional contact information for the dependency. Can contain any number of custom properties.
 * @property {DependencyCheckFunction} check - A function that performs the dependency check and returns a result.
 * @property {GenericCheckDetails|DatabaseCheckDetails|RestCheckDetails|SoapCheckDetails} [checkDetails] - Optional details about the check.
 * @property {string} [checkDetails.type] - The type of check (e.g., 'database', 'rest', 'soap', 'generic').
 * @property {number} [cacheDurationMs] - Optional override duration (in milliseconds) to cache the dependency check result.
 * @property {number} [refreshThresholdMs] - Optional override duration (in milliseconds) to refresh the dependency check result.
 * @example
 * const monitor = new DependencyMonitor();
 *
 * monitor.register({
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
 *    // Perform some check (e.g., ping a database)
 *    return SUCCESS_STATUS_CODE;
 *   },
 *   checkDetails: {
 *    type: 'database',
 *    server: 'localhost',
 *    database: 'mydb',
 *    dbType: 'mysql',
 *   }
 * });
 */
import { DependencyCheckResult } from './dependency-check-result';
import {
  GenericCheckDetails,
  DatabaseCheckDetails,
  RestCheckDetails,
  SoapCheckDetails,
} from './check-detail-types';
export type DependencyCheckOptions = {
  name: string;
  description: string;
  impact: string;
  skip?: boolean;
  contact?: {
    [key: string]: string;
  };
  check: () => Promise<DependencyCheckResult>;
  checkDetails?:
    | GenericCheckDetails
    | DatabaseCheckDetails
    | RestCheckDetails
    | SoapCheckDetails;
  cacheDurationMs?: number;
  refreshThresholdMs?: number;
};
