import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'dotenv';
import { type DotenvPopulateInput, expand } from 'dotenv-expand';
import { DEFAULT_ENV_PREFIX } from './static';

export function getEnvFilesForMode(envDir: string, mode?: string): string[] {
  const envFileNames = ['.env', '.env.local'];
  if (mode) {
    envFileNames.push(`.env.${mode}`, `.env.${mode}.local`);
  }
  return envFileNames.map((file) => path.normalize(path.join(envDir, file)));
}

/**
 * Loads environment variables from `.env` files and the current process environment,
 * applying specified prefixes to filter and expose variables.
 *
 * @param options - An object containing the following properties:
 * @param options.mode - The mode name used to determine which `.env` files to load.
 *                       The value `"local"` is not allowed as it conflicts with `.local` postfix for `.env` files.
 * @param options.envDir - The directory containing `.env` files. If `false`, no `.env` files will be loaded.
 * @param options.prefixes - A string or array of strings representing the prefixes used to filter environment variables.
 *                             Defaults to `DEFAULT_ENV_PREFIX`.
 * @returns A record of environment variables that match the specified prefixes.
 *
 * @throws {Error} If the `mode` is `"local"`.
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
