import mergeWith from 'lodash.mergewith';

import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import type { RecursivePartial } from './utils/types';

/**
 * Customizer function for merging objects, intended for use with utilities like `_.mergeWith`.
 *
 * - If either `objValue` or `srcValue` is an array, replaces the target array with the source array,
 *   concatenating the source array with the target array (source first).
 * - For non-array values, allows the default merge behavior.
 *
 * @param objValue - The destination value being merged.
 * @param srcValue - The source value being merged.
 * @returns The merged value if custom logic applies, otherwise `undefined` to use default merging.
 */
const customizer = (objValue: unknown, srcValue: unknown) => {
  if (Array.isArray(objValue) || Array.isArray(srcValue)) {
    // Replace arrays instead of merging/concatenating them
    return ((srcValue as Array<unknown>) ?? []).concat(objValue ?? []);
  }
  // For non-arrays, use default merge behavior
};

/**
 * Merges a base development server configuration with an overrides object.
 *
 * Uses lodash.mergeWith to deeply merge properties, with custom logic for arrays.
 * Arrays in the overrides object will replace arrays in the base config.
 *
 * @param base - The base development server configuration.
 * @param overrides - A partial configuration object containing properties to override in the base configuration.
 * @returns The merged development server configuration.
 *
 * Inline comments are provided for maintainability and clarity.
 */
export const mergeDevServerConfig = (
  base: DevServerOptions,
  overrides: RecursivePartial<DevServerOptions>,
): DevServerOptions => {
  // Use lodash.mergeWith to merge base and overrides, applying the customizer for arrays
  return mergeWith(base, overrides, customizer) as DevServerOptions;
};

// Export as default for convenience in imports
export default mergeDevServerConfig;
