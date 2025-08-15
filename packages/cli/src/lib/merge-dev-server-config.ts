import deepmerge from 'deepmerge';

import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import type { RecursivePartial } from './utils/types.js';

/**
 * Merges two arrays of objects by a specified key, ensuring that objects with the same key value
 * are merged, with the `source` array taking precedence over the `target` array for duplicate keys.
 *
 * @template TType - The type of objects contained in the arrays, extending `Record<string, unknown>`.
 * @param key - The property key used to identify and merge objects from both arrays.
 * @param target - The target array of objects to merge.
 * @param source - The source array of objects to merge, whose values take precedence on key conflicts.
 * @returns A new array containing merged objects, with uniqueness determined by the specified key.
 */
const keyedArrayMerger = <TType extends Record<string, unknown>>(
  key: keyof TType,
  target: Array<TType>,
  source: Array<TType>,
): Array<TType> => {
  const sourceRecords = source.reduce(
    (acc, item) => Object.assign(acc, { [String(item[key])]: item }),
    {} as TType,
  );
  const targetRecords = target.reduce(
    (acc, item) => Object.assign(acc, { [String(item[key])]: item }),
    {} as TType,
  );
  const mergedRecords = { ...targetRecords, ...sourceRecords };
  return Object.values(mergedRecords) as Array<TType>;
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
  return deepmerge(base, overrides, {
    arrayMerge: (target, source) => {
      // extract the first entry from both arrays to determine the merge strategy
      const entry = source[0] ?? target[0];

      // merge routes by 'match' if the entry is a route object
      if (typeof entry === 'object' && 'match' in entry && 'middleware' in entry) {
        return keyedArrayMerger('match', target, source);
      }
      return [...new Set([...target, ...source])];
    },
  }) as DevServerOptions;
};

// Export as default for convenience in imports
export default mergeDevServerConfig;
