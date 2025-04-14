/**
 * Represents the status of a dependency.
 * @typedef {Object} DependencyStatus
 * @property {string} name - The name of the dependency.
 * @property {string} description - Description of the dependency.
 * @property {string} impact - Impact of the dependency on the system.
 * @property {Object} [contact] - Optional Contact information for the dependency. Can contain any number of custom properties.
 * @property {Object} health - Health status of the dependency.
 * @property {string} health.state - Health state (e.g., 'OK', 'CRITICAL', 'WARNING').
 * @property {number} health.code - Health code (0: OK, 1: CRITICAL, 2: WARNING).
 * @property {number} health.latency - Latency of the dependency check in milliseconds.
 * @property {boolean} health.skipped - Indicates if the check was skipped.
 * @property {boolean} healthy - Indicates whether the dependency is healthy.
 * @property {string} lastChecked - The ISO timestamp of the last check.
 * @property {GenericCheckDetails|DatabaseCheckDetails|RestCheckDetails|SoapCheckDetails} [checkDetails] - Optional details about the check.
 * @property {string} [checkDetails.type] - The type of check (e.g., 'database', 'rest', 'soap', 'generic').
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
 * //   health: {
 * //     state: 'OK',
 * //     code: 0,
 * //     latency: 50,
 * //     skipped: false,
 * //   },
 * //   healthy: true,
 * //   lastChecked: '2023-10-01T12:00:00Z',
 * //   checkDetails: {
 * //     type: 'database',
 * //     server: 'localhost',
 * //     database: 'mydb',
 * //     dbType: 'mysql',
 * //   },
 * // }
 */
import {
  DatabaseCheckDetails,
  GenericCheckDetails,
  RestCheckDetails,
  SoapCheckDetails,
} from './check-detail-types';
export type DependencyStatus = {
  name: string;
  description: string;
  impact: string;
  contact?: {
    [key: string]: string;
  };
  health: {
    state: string;
    code: number
    latency: number;
    skipped: boolean;
  };
  healthy: boolean;
  lastChecked: string;
  checkDetails?:
    | GenericCheckDetails
    | DatabaseCheckDetails
    | RestCheckDetails
    | SoapCheckDetails;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  errorMessage?: string;
};
