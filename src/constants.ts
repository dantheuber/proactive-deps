/**
 * Expected status code for healthy dependencies.
 */
export const SUCCESS_STATUS_CODE: number = 0;
/**
 * Expected status code for unhealthy critical dependencies.
 */
export const ERROR_STATUS_CODE: number = 1;
/**
 * Expected status code for unhealthy non-critical dependencies.
 */
export const WARNING_STATUS_CODE: number = 2;
/**
 * Expected status message for healthy dependencies.
 */
export const SUCCESS_STATUS_MESSAGE: string = 'OK';
/**
 * Expected status message for unhealthy critical dependencies.
 */
export const ERROR_STATUS_MESSAGE: string = 'CRITICAL';
/**
 * Expected status message for unhealthy non-critical dependencies.
 */
export const WARNING_STATUS_MESSAGE: string = 'WARNING';

export const DEFAULT_CACHE_DURATION_MS: number = 60000; // 1 minute
export const DEFAULT_CHECK_TIMEOUT_MS: number = 5000; // 5 seconds
export const DEFAULT_REFRESH_THRESHOLD_MS: number = 5000; // 5 seconds

export const DEFAULT_CHECK_INTERVAL_MS: number = 15000; // 15 seconds
