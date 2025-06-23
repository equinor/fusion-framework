import deepmerge from 'deepmerge';
import type { AppConfig } from '@equinor/fusion-framework-cli/app';

/**
 * Merges a base application configuration object with an overrides object,
 * returning a new configuration object. If the `scopes` property is present
 * in the overrides, it will replace the corresponding property in the base
 * configuration instead of merging deeply.
 *
 * @typeParam T - The type of the application configuration object, extending `AppConfig`.
 * @param base - The base configuration object to merge into.
 * @param overrides - An object containing properties to override in the base configuration.
 * @returns A new configuration object resulting from merging `base` and `overrides`.
 */
export const mergeAppConfig = <T extends AppConfig>(base: T, overrides: Partial<T>): T => {
  // if scopes are provided in overrides, use the new scopes
  return deepmerge(base, overrides, {
    customMerge: (key) => {
      if (key === 'scopes') {
        return (_target, source) => {
          // If scopes are provided in overrides, replace the base scopes with the new ones
          return source;
        };
      }
      return undefined; // Use default merging for other keys
    },
  });
};
