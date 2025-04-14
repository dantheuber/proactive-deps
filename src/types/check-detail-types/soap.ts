/**
 * Defines the structure of a SOAP check.
 * @typedef {Object} SoapCheckDetails
 * @property {string} url - The URL location of the wsdl being called.
 * @property {string} method - The SOAP method being called.
 * @property {Record<string, string>} [headers] - Optional headers being included in the request. Do not expose real authentication tokens here. These are just examples.
 * @property {string} [body] - Optional body being sent in the request. Be careful not to expose any sensitive information here. These are just examples.
 * @property {number} [timeoutMs] - Optional timeout in milliseconds for the request.
 * @property {number} [expectedStatusCode] - Optional expected HTTP status code for a successful response.
 * @property {string} [expectedResponseBody] - Optional description of value in response body being checked for.
 * @example
 * const soapCheckDetails: SoapCheckDetails = {
 *   type: 'soap',
 *   wsdlUrl: 'http://example.com/service?wsdl',
 *   method: 'GetUserInfo',
 *   headers: {
 *     'Content-Type': 'text/xml; charset=utf-8',
 *     'SOAPAction': 'http://example.com/GetUserInfo',
 *   },
 *   body: '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetUserInfo xmlns="http://example.com/"/></soap:Body></soap:Envelope>',
 *   timeoutMs: 5000,
 *   expectedStatusCode: 200,
 *   expectedResponseBody: '<UserInfoResponse>...</UserInfoResponse>',
 * };
 */
export type SoapCheckDetails = {
  type: 'soap';
  wsdlUrl: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  expectedStatusCode?: number;
  expectedResponseBody?: string;
};
