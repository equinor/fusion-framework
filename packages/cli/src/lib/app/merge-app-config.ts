import mergeWith from 'lodash.mergewith';
import type { AppConfig } from './app-config';

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
  return mergeWith(base, overrides, (_, value, key) => {
    if (key === 'scopes') {
      return value;
    }
  }) as T;
};
