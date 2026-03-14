/**
 * @packageDocumentation
 *
 * `@equinor/fusion-load-env` provides utilities for loading, parsing, and
 * serializing environment variables with prefix-based namespacing.
 *
 * Key exports:
 *
 * - {@link loadEnv} — load `.env` files and merge with `process.env`.
 * - {@link envToObject} — parse flat env vars into a nested config object.
 * - {@link objectToEnv} — serialize a config object into `KEY=value` pairs.
 * - {@link DEFAULT_ENV_PREFIX} — the default `"FUSION"` prefix constant.
 */
export { objectToEnv } from './object-to-env.js';
export { envToObject } from './env-to-object.js';
export { loadEnv } from './load-env.js';
export { DEFAULT_ENV_PREFIX } from './static.js';
