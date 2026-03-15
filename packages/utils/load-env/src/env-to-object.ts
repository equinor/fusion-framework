import { DEFAULT_ENV_PREFIX } from './static';

/**
 * Parse a flat record of environment variables into a nested configuration object.
 *
 * Use this function to rehydrate structured configuration from `process.env` or
 * the output of {@link loadEnv}. Only keys that start with the given prefix are
 * included; the prefix is stripped before nesting. Each remaining `_`-delimited
 * segment becomes a level in the result object, and leaf values are JSON-parsed
 * so booleans and numbers arrive as their native types.
 *
 * Keys listed in `camelcase` are kept flat and converted to camelCase rather than
 * being split into nested levels (e.g. `ANOTHER_KEY` → `anotherKey` instead of
 * `{ another: { key: … } }`).
 *
 * @template T - Expected shape of the resulting configuration object.
 * @param env - Flat record of environment variables (e.g. `process.env`).
 * @param options - Optional transformation settings.
 * @param options.prefix - Prefix used to filter relevant keys. Defaults to {@link DEFAULT_ENV_PREFIX} (`"FUSION"`).
 * @param options.camelcase - Array of suffix strings that should remain flat and be converted to camelCase.
 * @returns A nested object of type `T` derived from the matched environment variables.
 *
 * @throws {Error} If a key listed in `camelcase` also appears as a nested segment — indicates an ambiguous schema.
 * @throws {Error} If an internal key-processing step produces an unexpected `undefined` segment.
 *
 * @example
 * ```ts
 * import { envToObject } from '@equinor/fusion-load-env';
 *
 * const env = {
 *   FUSION_API_URL: '"https://api.example.com"',
 *   FUSION_FEATURE_ENABLED: 'true',
 * };
 *
 * const config = envToObject<{ api: { url: string }; feature: { enabled: boolean } }>(env);
 * // { api: { url: 'https://api.example.com' }, feature: { enabled: true } }
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
 * Convert a UPPER_SNAKE_CASE or snake_case string to camelCase.
 *
 * @param str - The snake_case string to transform.
 * @returns The camelCase representation of `str`.
 */
function toCamelCase(str: string): string {
  return str.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

export default envToObject;
