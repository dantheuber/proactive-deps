/**
 * Generic check details type. For use when no other check type is applicable.
 * This is a placeholder and should be replaced with a more specific type if possible.
 * Can contain any number of custom properties.
 * @typedef {Object} GenericCheckDetails
 * @property {string} type - The type of check, which is 'generic' in this case.
 * @property {any} [key] - Can contain any number of custom properties.
 * @example
 * const genericCheckDetails: GenericCheckDetails = {
 *   type: 'generic',
 *   customProperty1: 'value1',
 *   customProperty2: 42,
 *   customProperty3: true,
 * };
 */
export type GenericCheckDetails = {
  type: 'generic';
  [key: string]: any;
};
