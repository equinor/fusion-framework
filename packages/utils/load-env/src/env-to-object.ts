import { DEFAULT_ENV_PREFIX } from './static';

/**
 * Converts an environment variables object into a nested object structure based on a specified prefix and camelcase rules.
 *
 * @template T - The expected shape of the resulting object.
 * @param env - A record of environment variables where keys are strings and values are strings.
 * @param options - Optional configuration for the transformation.
 * @param options.prefix - A string prefix to filter and process environment variable keys. Defaults to `DEFAULT_ENV_PREFIX`.
 * @param options.camelcase - An array of keys that should remain flat and be converted to camelCase.
 * @returns A nested object of type `T` derived from the environment variables.
 *
 * @throws {Error} If a key defined as flat in `camelcase` is encountered in a nested structure.
 * @throws {Error} If an unexpected undefined value is encountered in the key processing.
 *
 * @example
 * ```typescript
 * const env = {
 *   APP_PREFIX_FOO_BAR: "true",
 *   APP_PREFIX_BAZ: "42",
 *   APP_PREFIX_CAMEL_CASE: "value"
 * };
 *
 * const result = envToObject(env, {
 *   prefix: "APP_PREFIX_",
 *   camelcase: ["camelCase"]
 * });
 *
 * console.log(result);
 * // Output:
 * // {
 * //   foo: { bar: true },
 * //   baz: 42,
 * //   camelCase: "value"
 * // }
 * ```
 */
export function envToObject<T extends Record<string, unknown>>(
  env: Record<string, string>,
  options?: {
    prefix?: string;
    camelcase?: string[];
  },
): T {
  const { prefix = DEFAULT_ENV_PREFIX, camelcase = [] } = options || {};
  // biome-ignore lint/suspicious/noExplicitAny: We need to use `any` here to allow for dynamic key assignment.
  const result: any = {};

  for (const [key, value] of Object.entries(env)) {
    // Skip entries that do not start with the prefix
    if (!key.startsWith(prefix)) {
      continue;
    }

    // Remove the prefix from the key
    const strippedKey = key.slice(prefix.length).replace(/^_/, '');

    // Check if the key should stay together
    if (camelcase.includes(strippedKey)) {
      const camelKey = toCamelCase(strippedKey);
      result[camelKey as keyof T] = JSON.parse(value);
      continue;
    }

    const keys = strippedKey.split('_').map((part) => toCamelCase(part));

    let current = result;
    while (keys.length > 1) {
      const part = keys.shift();
      if (part === undefined) {
        throw new Error('Unexpected undefined value in keys array.');
      }

      // Ensure `current[part]` is an object before nesting further
      if (camelcase.includes(part)) {
        throw new Error(`Conflict: Key "${part}" is defined as a flat key but is being nested.`);
      }

      if (typeof current[part] !== 'object' || current[part] === null) {
        current[part] = {};
      }

      current = current[part];
    }

    current[keys[0]] = JSON.parse(value);
  }

  return result;
}

/**
 * Converts a snake_case or uppercase string to camelCase.
 *
 * @param str - The string to convert.
 * @returns The camelCase version of the string.
 */
function toCamelCase(str: string): string {
  return str.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

export default envToObject;
