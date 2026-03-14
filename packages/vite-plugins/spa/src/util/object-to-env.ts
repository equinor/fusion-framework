/**
 * Flattens a nested object into a single-level record with
 * `UPPER_SNAKE_CASE` keys suitable for Vite's `config.define`.
 *
 * @remarks
 * Used internally by the Fusion SPA plugin to convert the object
 * returned by {@link PluginOptions.generateTemplateEnv} into
 * `import.meta.env.*` defines.
 *
 * - camelCase keys are converted to UPPER_SNAKE_CASE.
 * - Nested objects are recursively flattened with `_` separators.
 * - Arrays and primitives are JSON-stringified.
 *
 * @param obj - The object to flatten.
 * @param prefix - Key prefix prepended to every output key.
 * @returns A flat record mapping `PREFIX_KEY` strings to JSON-stringified values.
 *
 * @defaultValue prefix — `'FUSION_SPA'`
 *
 * @example
 * ```ts
 * objectToEnv({ portal: { id: 'my-portal' } }, 'FUSION_SPA');
 * // => { FUSION_SPA_PORTAL_ID: '"my-portal"' }
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
