import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'dotenv';
import { type DotenvPopulateInput, expand } from 'dotenv-expand';
import { DEFAULT_ENV_PREFIX } from './static';

/**
 * Resolve the ordered list of `.env` file paths for a given directory and mode.
 *
 * The returned order determines override priority — later files override earlier
 * ones when the same key exists. For mode `"dev"` the order is:
 * `.env`, `.env.local`, `.env.dev`, `.env.dev.local`.
 *
 * @param envDir - Absolute or relative path to the directory containing `.env` files.
 * @param mode - Optional environment mode name (e.g. `"dev"`, `"production"`).
 * @returns An array of normalized absolute file paths in load order.
 */
export function getEnvFilesForMode(envDir: string, mode?: string): string[] {
  const envFileNames = ['.env', '.env.local'];
  if (mode) {
    envFileNames.push(`.env.${mode}`, `.env.${mode}.local`);
  }
  return envFileNames.map((file) => path.normalize(path.join(envDir, file)));
}

/**
 * Load environment variables from `.env` files and merge them with `process.env`.
 *
 * Use this function at application startup to populate configuration from
 * `.env` files with support for per-mode overrides (e.g. `.env.dev`,
 * `.env.production.local`). Only variables whose key starts with one of the
 * specified prefixes are returned, keeping the result scoped and safe.
 *
 * Inline `process.env` values take priority over file-based values so that
 * CI/CD pipelines or Docker `--env` flags always win.
 *
 * Variable interpolation (e.g. `$OTHER_VAR`) is supported via `dotenv-expand`.
 *
 * @param options - Configuration for the load operation.
 * @param options.envDir - Directory containing `.env` files. Defaults to `process.cwd()`. Pass `false` to skip file loading entirely.
 * @param options.mode - Environment mode name (e.g. `"dev"`, `"production"`). Determines which
 *   mode-specific `.env` files are loaded. `"local"` is reserved and will throw.
 * @param options.prefixes - One or more key prefixes used to filter variables.
 *   Defaults to {@link DEFAULT_ENV_PREFIX} (`"FUSION"`).
 * @returns A flat `Record<string, string>` of matching environment variables.
 *
 * @throws {Error} If `mode` is `"local"` — this value conflicts with the `.local` file suffix convention.
 *
 * @example
 * ```ts
 * import { loadEnv } from '@equinor/fusion-load-env';
 *
 * // Load all FUSION_* variables for the "dev" mode
 * const env = loadEnv({ mode: 'dev' });
 * console.log(env);
 * // { FUSION_API_URL: '...', FUSION_CLIENT_ID: '...' }
 *
 * // Use a custom prefix and explicit directory
 * const custom = loadEnv({ mode: 'production', prefixes: 'MY_APP', envDir: './config' });
 * ```
 */
export const loadEnv = (options: {
  envDir?: string;
  mode?: string;
  prefixes?: string | string[];
}): Record<string, string> => {
  const { mode, envDir, prefixes = DEFAULT_ENV_PREFIX } = options;

  if (mode === 'local') {
    throw new Error(
      `"local" cannot be used as a mode name because it conflicts with the .local postfix for .env files.`,
    );
  }
  const envPrefix = Array.isArray(prefixes) ? prefixes : [prefixes];
  const env: Record<string, string> = {};
  const envFiles = getEnvFilesForMode(envDir ?? process.cwd(), mode);

  const parsed = Object.fromEntries(
    envFiles.flatMap((filePath) => {
      if (!fs.statSync(filePath, { throwIfNoEntry: false })) {
        return [];
      }

      return Object.entries(parse(fs.readFileSync(filePath)));
    }),
  );

  // let environment variables use each other. make a copy of `process.env` so that `dotenv-expand`
  // doesn't re-assign the expanded values to the global `process.env`.
  const processEnv = { ...process.env } as DotenvPopulateInput;
  expand({ parsed, processEnv });

  // only keys that start with prefix are exposed to client
  for (const [key, value] of Object.entries(parsed)) {
    if (envPrefix.some((prefix) => key.startsWith(prefix))) {
      env[key] = value;
    }
  }

  // check if there are actual env variables starting with the prefix
  // these are typically provided inline and should be prioritized
  for (const key in process.env) {
    if (envPrefix.some((prefix) => key.startsWith(prefix))) {
      env[key] = process.env[key] as string;
    }
  }

  return env;
};
