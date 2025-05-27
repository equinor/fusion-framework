import mergeWith from 'lodash.mergewith';

import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import type { RecursivePartial } from './utils/types';

/**
 * Customizer function for lodash.mergeWith to handle merging arrays.
 *
 * If the property being merged is an array, the source value replaces the object value.
 * This prevents arrays from being concatenated, which is the default lodash behavior.
 *
 * @param objValue - The value from the base object.
 * @param srcValue - The value from the overrides object.
 * @returns The value to use in the merged result, or undefined to use default merging.
 */
const customizer = (objValue: unknown, srcValue: unknown) => {
  if (Array.isArray(objValue)) {
    // Replace arrays instead of merging/concatenating them
    return srcValue;
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
