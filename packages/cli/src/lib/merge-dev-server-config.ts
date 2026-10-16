import deepmerge from 'deepmerge';

import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import type { RecursivePartial } from './utils/types.js';

/**
 * Merges two route arrays by `match`, with `source` routes replacing `target` routes that share a key.
 *
 * String and string-array matchers key by their text so an override replaces the default route
 * for the same path. Function matchers key by identity: their source text is identical for
 * closures created by the same factory, so stringifying them would collapse distinct routes.
 *
 * @template TType - The route type, which must expose the `match` key.
 * @param key - The property key used to identify and merge entries from both arrays.
 * @param target - The default routes.
 * @param source - The override routes, whose entries take precedence on key conflicts.
 * @returns The merged routes, keeping each key's first position and appending new keys in order.
 */
const keyedArrayMerger = <TType extends Record<string, unknown>>(
  key: keyof TType,
  target: Array<TType>,
  source: Array<TType>,
): Array<TType> => {
  const merged = new Map<unknown, TType>();
  // Map.set keeps an existing key's position, so overrides replace defaults in place.
  for (const item of [...target, ...source]) {
    const value = item[key];
    merged.set(typeof value === 'function' ? value : String(value), item);
  }
  return [...merged.values()];
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
        const routeEntries = target.concat(source);
        // Keyed merging reads each route's match, so verify both arrays first.
        const allEntriesAreRoutes = routeEntries.every(
          (item) =>
            typeof item === 'object' &&
            item !== null &&
            'match' in item &&
            ('middleware' in item || 'proxy' in item),
        );
        // Preserve malformed entries for schema validation instead of dereferencing them here.
        if (allEntriesAreRoutes) {
          return keyedArrayMerger('match', target, source);
        }
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
    let unchanged = true;
    // Keep shared references when recursive cleanup finds no undefined values.
    const cleaned = value.map((entry) => {
      const cleanedEntry = omitUndefined(entry);
      // Track nested changes so the original array can be reused when nothing was removed.
      if (cleanedEntry !== entry) {
        unchanged = false;
      }
      return cleanedEntry;
    });
    // Keep unchanged array references so shared entries remain deduplicable.
    return unchanged ? value : cleaned;
  }
  // Preserve primitives, nulls, and class instances exactly as supplied.
  if (
    value === null ||
    typeof value !== 'object' ||
    (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
  ) {
    return value;
  }
  let unchanged = true;
  const entries = Object.entries(value)
    // Remove omitted properties so callers retain configured defaults.
    // Exclude only absent overrides, leaving explicit nulls intact.
    .filter(([, entry]) => {
      // Removing an undefined override requires a new containing object.
      if (entry === undefined) {
        unchanged = false;
        return false;
      }
      return true;
    })
    // Clean nested values using the same undefined-preservation rule.
    .map(([key, entry]) => {
      const cleanedEntry = omitUndefined(entry);
      // Rebuild the containing object only when a nested value changed.
      if (cleanedEntry !== entry) {
        unchanged = false;
      }
      return [key, cleanedEntry] as const;
    });
  // Keep unchanged object references so shared array entries remain deduplicable.
  if (unchanged) {
    return value;
  }
  return Object.fromEntries(entries);
};

// Export as default for convenience in imports
export default mergeDevServerConfig;
