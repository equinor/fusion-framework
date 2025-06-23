import deepmerge from 'deepmerge';

import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import type { RecursivePartial } from './utils/types.js';

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
  return deepmerge(base, overrides) as DevServerOptions;
};

// Export as default for convenience in imports
export default mergeDevServerConfig;
