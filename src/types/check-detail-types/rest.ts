/**
 * Defines the structure of a REST check.
 * @typedef {Object} RestCheckDetails
 * @property {string} type - The type of check, which is 'rest' for REST checks.
 * @property {string} url - The URL being called.
 * @property {string} method - The HTTP method (e.g., GET, POST).
 * @property {Record<string, string>} [headers] - Optional headers being included in the request. Do not expose real authentication tokens here These are just examples.
 * @property {string} [body] - Optional body being sent in the request. Be careful not to expose any sensitive information here. These are just examples.
 * @property {number} [timeoutMs] - Optional in milliseconds for the request.
 * @property {number} [expectedStatusCode] - Optional expected HTTP status code for a successful response.
 * @property {string|RegExp} [expectedResponseBody] - Optional value in response body being checked for. Can be a string or a regular expression.
 */
export type RestCheckDetails = {
  type: 'rest';
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  expectedStatusCode?: number;
  expectedResponseBody?: string | RegExp;
}