import { FileNotFoundError } from '@equinor/fusion-imports';
import type { AppManifest } from '@equinor/fusion-framework-module-app';

import { resolvePackage, type ResolvedPackage } from '../utils/resolve-package.js';
import { createAppManifestFromPackage } from '../app/create-app-manifest-from-package.js';
import { loadAppManifest } from '../app/load-app-manifest.js';
import { loadAppConfig } from '../app/load-app-config.js';
import type { ApiAppConfig } from '../app/api-app-config-schema.js';
import type { RuntimeEnv } from '../types.js';

/**
 * The application manifest and config resolved for a test run.
 */
export type AppTestEnv = {
  manifest: AppManifest;
  config: ApiAppConfig;
};

/**
 * Options for {@link resolveAppTestEnv}.
 */
export type ResolveAppTestEnvOptions = {
  /** Directory to resolve the package, manifest, and config from. Defaults to `process.cwd()`. */
  cwd?: string;
  /** Explicit manifest file to load instead of the default `app.manifest(.*)?` lookup. */
  manifestPath?: string;
  /** Explicit config file to load instead of the default `app.config(.*)?` lookup. */
  configPath?: string;
};

/**
 * Resolves an application's manifest and config using the same pipeline `ffc app build`/
 * `ffc app dev` use: a base manifest generated from `package.json`, merged with a local
 * `app.manifest.ts` if one exists; and `app.config.ts` for endpoints/environment, falling
 * back to an empty config if none exists.
 *
 * @remarks
 * Intended to seed `@equinor/fusion-framework-react-app/vitest`'s `testApp` `env` fixture, so
 * a test suite exercises the application's real manifest/config instead of a hand-maintained
 * duplicate. Anything a specific test still needs faked (a missing endpoint, a different
 * `appKey`) can be layered on top with `testApp.extend('env', ...)` or a per-test
 * `test.override('env', ...)`.
 *
 * @param options - Resolution options; `cwd` defaults to the current working directory.
 * @returns The resolved application manifest and config.
 * @throws If no `package.json` can be found from `cwd` upward, or an explicitly requested
 * `manifestPath`/`configPath` does not exist.
 * @example
 * ```ts
 * import { resolveAppTestEnv } from '@equinor/fusion-framework-cli/vitest';
 * import { testApp } from '@equinor/fusion-framework-react-app/vitest';
 * import { configure } from '../config';
 *
 * const test = testApp
 *   .extend('env', { injected: true }, () => resolveAppTestEnv())
 *   .extend('configure', { injected: true }, () => configure);
 * ```
 */
export const resolveAppTestEnv = async (
  options?: ResolveAppTestEnvOptions,
): Promise<AppTestEnv> => {
  const pkg: ResolvedPackage = await resolvePackage({ cwd: options?.cwd });
  const env: RuntimeEnv = { command: 'build', mode: 'test', root: pkg.root, environment: 'test' };

  const baseManifest = createAppManifestFromPackage(env, pkg.packageJson);
  const [manifest, config] = await Promise.all([
    resolveManifest(env, baseManifest, options?.manifestPath),
    resolveConfig(env, options?.configPath),
  ]);

  return { manifest, config };
};

/**
 * Loads `app.manifest(.*)?`, falling back to the package-derived manifest when none exists —
 * mirrors `ffc app build`'s own fallback so a test env matches a real build with zero manifest file.
 */
const resolveManifest = async (
  env: RuntimeEnv,
  base: AppManifest,
  file?: string,
): Promise<AppManifest> => {
  try {
    return (await loadAppManifest(env, { base, file })).manifest;
  } catch (err) {
    // an explicitly requested manifest that's missing is a real error; only the default lookup falls back
    if (err instanceof FileNotFoundError && !file) return base;
    throw err;
  }
};

/**
 * Loads `app.config(.*)?`, falling back to an empty config when none exists — mirrors
 * `ffc app build`'s own fallback so a test env matches a real build with zero config file.
 */
const resolveConfig = async (env: RuntimeEnv, file?: string): Promise<ApiAppConfig> => {
  try {
    return (await loadAppConfig(env, { file })).config;
  } catch (err) {
    // an explicitly requested config that's missing is a real error; only the default lookup falls back
    if (err instanceof FileNotFoundError && !file) return { environment: {} };
    throw err;
  }
};

export default resolveAppTestEnv;
