/**
 * Defines the structure of a SOAP check.
 * @typedef {Object} SoapCheckDetails
 * @property {string} url - The URL location of the wsdl being called.
 * @property {string} method - The SOAP method being called.
 * @property {string[]} [headers] - Optional headers being included in the request. Do not expose real authentication tokens here. These are just examples.
 * @property {string} [body] - Optional body being sent in the request. Be careful not to expose any sensitive information here. These are just examples.
 * @property {number} [timeoutMs] - Optional timeout in milliseconds for the request.
 * @property {number} [expectedStatusCode] - Optional expected HTTP status code for a successful response.
 * @property {string} [expectedResponseBody] - Optional value in response body being checked for.
 */
export type SoapCheckDetails = {
  type: 'soap';
  wsdlUrl: string;
  method: string;
  headers?: string[];
  body?: string;
  timeoutMs?: number;
  expectedStatusCode?: number;
  expectedResponseBody?: string;
}