/**
 * Combines two arrays found at the same key in a base config and its overrides.
 *
 * @param base - Array from the base config.
 * @param overrides - Array from the overrides.
 * @param key - Property key holding both arrays.
 * @returns The array to keep in the merged config.
 */
export type MergeConfigArrays = (base: unknown[], overrides: unknown[], key: string) => unknown[];

type ConfigObject = Record<string, unknown>;

/**
 * Checks whether a value is an object literal, as opposed to an array or a class instance
 * such as `Date` or `URL`, which replace rather than merge.
 *
 * @param value - Value to inspect.
 * @returns `true` when the value is a plain object.
 */
const isConfigObject = (value: unknown): value is ConfigObject => {
  // Primitives and null replace rather than merge
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

/**
 * Default array strategy: append override entries after base entries.
 *
 * @param base - Array from the base config.
 * @param overrides - Array from the overrides.
 * @returns A new array with base entries followed by override entries.
 */
const appendArrays: MergeConfigArrays = (base, overrides) => base.concat(overrides);

/**
 * Merges one value from the overrides into the matching base value.
 *
 * @param base - Value from the base config.
 * @param overrides - Value from the overrides.
 * @param mergeArrays - Strategy used when both values are arrays.
 * @param key - Property key of the values, passed to `mergeArrays`.
 * @returns The merged value.
 */
const mergeValue = (
  base: unknown,
  overrides: unknown,
  mergeArrays: MergeConfigArrays,
  key: string,
): unknown => {
  // Both sides are lists, so the caller's strategy decides how to combine them
  if (Array.isArray(base) && Array.isArray(overrides)) {
    return mergeArrays(base, overrides, key);
  }
  // Anything other than two plain objects is replaced by the override
  if (!isConfigObject(base) || !isConfigObject(overrides)) {
    return overrides;
  }
  // Start from the base keys so keys absent from the overrides survive
  const result: ConfigObject = { ...base };
  // Skip `__proto__`: assigning it would replace the result's prototype (GHSA-gcqx-w48m-w2h4)
  const entries = Object.entries(overrides).filter(([entryKey]) => entryKey !== '__proto__');
  // Overlay each override key, recursing where both sides define it
  for (const [entryKey, value] of entries) {
    result[entryKey] = Object.hasOwn(base, entryKey)
      ? mergeValue(base[entryKey], value, mergeArrays, entryKey)
      : value;
  }
  return result;
};

/**
 * Deeply merges CLI config overrides (app config, app or portal manifest, dev-server config)
 * into a base config without mutating either input.
 *
 * Plain objects merge key by key with override values winning, including an explicit `undefined`.
 * Arrays are appended unless `mergeArrays` says otherwise. Any other value, including class
 * instances, replaces the base value. Nested values that are not overridden are shared with
 * the inputs rather than copied.
 *
 * @template T - Shape of the config.
 * @param base - Base config.
 * @param overrides - Partial config whose values take precedence.
 * @param mergeArrays - Strategy for combining two arrays at the same key. Defaults to appending.
 * @returns A new config containing the merged values.
 *
 * @example
 * ```ts
 * mergeConfig({ server: { port: 3000 }, scopes: ['a'] }, { server: { host: 'x' }, scopes: ['b'] });
 * // { server: { port: 3000, host: 'x' }, scopes: ['a', 'b'] }
 * ```
 */
export const mergeConfig = <T>(
  base: T,
  overrides: unknown,
  mergeArrays: MergeConfigArrays = appendArrays,
): T => mergeValue(base, overrides, mergeArrays, '') as T;
