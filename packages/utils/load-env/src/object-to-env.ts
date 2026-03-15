import { DEFAULT_ENV_PREFIX } from './static';

/**
 * Convert a nested JavaScript object into a flat record of environment variable entries.
 *
 * Use this function when you need to serialize application configuration into
 * `KEY=value` pairs suitable for `process.env`, `.env` files, or Docker build-args.
 *
 * Nested objects are recursively flattened; each nesting level is joined with an
 * underscore. camelCase keys are converted to UPPER_SNAKE_CASE.
 * Non-object values are stringified with `String()`.
 *
 * @param obj - The configuration object to flatten and convert.
 * @param options - Optional settings for the conversion.
 * @param options.prefix - Prefix prepended to every key. Defaults to {@link DEFAULT_ENV_PREFIX} (`"FUSION"`).
 * @returns A flat `Record<string, string>` where keys are `PREFIX_UPPER_SNAKE` and values are stringified.
 *
 * @example
 * ```ts
 * import { objectToEnv } from '@equinor/fusion-load-env';
 *
 * const config = { apiUrl: 'https://api.example.com', feature: { enabled: true } };
 * const env = objectToEnv(config);
 * // { FUSION_API_URL: 'https://api.example.com', FUSION_FEATURE_ENABLED: 'true' }
 *
 * const custom = objectToEnv(config, { prefix: 'MY_APP' });
 * // { MY_APP_API_URL: 'https://api.example.com', MY_APP_FEATURE_ENABLED: 'true' }
 * ```
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
