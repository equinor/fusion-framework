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
  // Index source records by key for O(1) lookup during the merge below
  const sourceRecords = source.reduce(
    (acc, item) => Object.assign(acc, { [String(item[key])]: item }),
    {} as TType,
  );
  // Index target records by key so source entries can override matching keys
  const targetRecords = target.reduce(
    (acc, item) => Object.assign(acc, { [String(item[key])]: item }),
    {} as TType,
  );
  // Overlay source records onto target records so source entries win on matching keys
  const mergedRecords = { ...targetRecords, ...sourceRecords };
  return Object.values(mergedRecords) as Array<TType>;
};

/**
 * Merges a base development server configuration with an overrides object.
 *
 * Objects merge recursively. Route arrays merge entries by `match`; other arrays append to
 * the base and deduplicate equal primitive values or identical object references. Undefined
 * object properties preserve the base value, while `null` explicitly replaces it.
 *
 * @param base - The base development server configuration.
 * @param overrides - A partial configuration object containing properties to override in the base configuration.
 * @returns The merged development server configuration.
 */
export const mergeDevServerConfig = (
  base: DevServerOptions,
  overrides: RecursivePartial<DevServerOptions>,
): DevServerOptions => {
  return deepmerge(base, omitUndefined(overrides) as RecursivePartial<DevServerOptions>, {
    arrayMerge: (target, source) => {
      // extract the first entry from both arrays to determine the merge strategy
      const entry = source[0] ?? target[0];

      // merge routes by 'match' if the entry is a route object
      if (
        typeof entry === 'object' &&
        entry !== null &&
        'match' in entry &&
        ('middleware' in entry || 'proxy' in entry)
      ) {
        return keyedArrayMerger('match', target, source);
      }
      // Deduplicate the combined target and source entries
      return [...new Set([...target, ...source])];
    },
  }) as DevServerOptions;
};

/**
 * Removes undefined object properties so absent overrides cannot erase configured defaults.
 *
 * @param value - The override value to clean.
 * @returns A copy with undefined object properties omitted.
 */
const omitUndefined = (value: unknown): unknown => {
  // Keep array positions while cleaning nested records.
  if (Array.isArray(value)) {
    // Recurse into array entries without changing their ordering.
    return value.map(omitUndefined);
  }
  // Preserve primitives, nulls, and class instances exactly as supplied.
  if (
    value === null ||
    typeof value !== 'object' ||
    (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
  ) {
    return value;
  }
  return Object.fromEntries(
    // Remove omitted properties so callers retain configured defaults.
    Object.entries(value)
      // Exclude only absent overrides, leaving explicit nulls intact.
      .filter(([, entry]) => entry !== undefined)
      // Clean nested values using the same undefined-preservation rule.
      .map(([key, entry]) => [key, omitUndefined(entry)]),
  );
};

// Export as default for convenience in imports
export default mergeDevServerConfig;
