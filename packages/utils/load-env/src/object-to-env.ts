import { DEFAULT_ENV_PREFIX } from './static';

/**
 * Converts a nested object into a flat object with keys in snake_case and uppercase.
 * Nested keys are prefixed with their parent keys, separated by underscores.
 * Non-object values are stringified.
 *
 * @param obj - The input object to be flattened and converted.
 * @param prefix - An optional prefix to prepend to the keys (default is an empty string).
 * @returns A flat object with snake_case, uppercase keys and stringified values.
 *
 */
export function objectToEnv(obj: object, options?: { prefix?: string }): Record<string, string> {
  return Object.entries(obj).reduce((result, [key, value]) => {
    const basePrefix = options?.prefix ?? DEFAULT_ENV_PREFIX;
    // Convert camelCase to snake_case and uppercase
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();

    const prefix = `${basePrefix.replace(/_$/, '')}_${snakeKey}`;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      return Object.assign(result, objectToEnv(value, { prefix }));
    }

    return Object.assign(result, { [prefix]: String(value) });
  }, {});
}

export default objectToEnv;
