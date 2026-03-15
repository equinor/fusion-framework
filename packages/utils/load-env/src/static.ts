/**
 * Default prefix used to namespace environment variables.
 *
 * All load-env utilities filter and generate keys that start with this prefix,
 * preventing collisions with unrelated variables in `process.env`.
 *
 * Override per-call by passing a custom `prefix` option to {@link loadEnv},
 * {@link envToObject}, or {@link objectToEnv}.
 *
 * @example
 * ```ts
 * import { DEFAULT_ENV_PREFIX } from '@equinor/fusion-load-env';
 * // DEFAULT_ENV_PREFIX === 'FUSION'
 * ```
 */
export const DEFAULT_ENV_PREFIX = 'FUSION' as const;
