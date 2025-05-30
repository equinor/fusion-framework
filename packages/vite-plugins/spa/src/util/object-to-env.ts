/**
 * Converts a nested object into a flat object with keys in snake_case and uppercase.
 * Nested keys are prefixed with their parent keys, separated by underscores.
 * Non-object values are stringified.
 *
 * @param obj - The input object to be flattened and converted.
 * @param prefix - An optional prefix to prepend to the keys (default is an empty string).
 * @returns A flat object with snake_case, uppercase keys and stringified values.
 *
 * @example
 * ```typescript
 * const input = {
 *   someKey: "value",
 *   nestedObject: {
 *     anotherKey: 42,
 *     deepNested: {
 *       finalKey: true
 *     }
 *   }
 * };
 *
 * const result = objectToEnv(input);
 * console.log(result);
 * // Output:
 * // {
 * //   SOME_KEY: "\"value\"",
 * //   NESTED_OBJECT_ANOTHER_KEY: "42",
 * //   NESTED_OBJECT_DEEP_NESTED_FINAL_KEY: "true"
 * // }
 * ```
 */
export function objectToEnv(obj: object, prefix = 'FUSION_SPA'): Record<string, string> {
  return Object.entries(obj).reduce((result, [key, value]) => {
    // Convert camelCase to snake_case and uppercase
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();

    const newPrefix = prefix ? `${prefix.replace(/_$/, '')}_${snakeKey}` : snakeKey;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      return Object.assign(result, objectToEnv(value, newPrefix));
    }
    // Stringify non-object values
    return Object.assign(result, { [newPrefix]: JSON.stringify(value) });
  }, {});
}

export default objectToEnv;
