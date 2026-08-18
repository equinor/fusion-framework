import { FileNotFoundError } from '@equinor/fusion-imports';
import type { AppManifest } from '@equinor/fusion-framework-module-app';
import type { RuntimeEnv } from '@equinor/fusion-framework-cli';
import {
  createAppManifestFromPackage,
  loadAppManifest,
  loadAppConfig,
  mergeAppManifests,
  ApiAppConfigSchema,
  type AppManifestFn,
  type AppConfigFn,
  type ApiAppConfig,
} from '@equinor/fusion-framework-cli/app';
import { resolvePackage } from '@equinor/fusion-framework-cli/utils';

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
  entrypoint?: string;
  /**
   * An explicit manifest file to load instead of the default `app.manifest(.*)?` lookup, or a
   * manifest function (same shape as `defineAppManifest`'s argument) applied directly.
   */
  manifest?: string | AppManifestFn;
  /**
   * An explicit config file to load instead of the default `app.config(.*)?` lookup, or a
   * config function (same shape as `defineAppConfig`'s argument) applied directly.
   */
  config?: string | AppConfigFn;
};

/**
 * Resolves an application's manifest and config using the same pipeline `ffc app build`/
 * `ffc app dev` use: a base manifest generated from `package.json`, merged with a local
 * `app.manifest.ts` if one exists; and `app.config.ts` for endpoints/environment, falling
 * back to an empty config if none exists.
 *
 * @remarks
 * Intended to seed `@equinor/fusion-framework-vitest-plugin-react-app/test`'s `testApp` `env` fixture, so
 * a test suite exercises the application's real manifest/config instead of a hand-maintained
 * duplicate. Anything a specific test still needs faked (a missing endpoint, a different
 * `appKey`) can be layered on top with `testApp.extend('env', ...)` or a per-test
 * `test.override('env', ...)`.
 *
 * @param options - Resolution options; `entrypoint` defaults to the current working directory.
 * @returns The resolved application manifest and config.
 * @throws If no `package.json` can be found from `entrypoint` upward, or an explicitly requested
 * `manifest`/`config` file does not exist.
 * @example
 * ```ts
 * import { resolveAppTestEnv } from '@equinor/fusion-framework-vitest-plugin-react-app';
 * import { testApp } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
 * import { configure } from '../config';
 *
 * const test = testApp
 *   .extend('env', { injected: true }, () => resolveAppTestEnv())
 *   .extend('configureApp', { injected: true }, () => configure);
 * ```
 */
export const resolveAppTestEnv = async (
  options?: ResolveAppTestEnvOptions,
): Promise<AppTestEnv> => {
  const pkg = await resolvePackage({ cwd: options?.entrypoint });
  const env: RuntimeEnv = { command: 'build', mode: 'test', root: pkg.root, environment: 'test' };

  const baseManifest = createAppManifestFromPackage(env, pkg.packageJson);
  const [manifest, config] = await Promise.all([
    resolveManifest(env, baseManifest, options?.manifest),
    resolveConfig(env, options?.config),
  ]);

  return { manifest, config };
};

/**
 * Loads `app.manifest(.*)?` (or applies an inline {@link AppManifestFn}), falling back to the
 * package-derived manifest when none exists — mirrors `ffc app build`'s own fallback so a test
 * env matches a real build with zero manifest file.
 */
const resolveManifest = async (
  env: RuntimeEnv,
  base: AppManifest,
  manifest?: string | AppManifestFn,
): Promise<AppManifest> => {
  // an inline function is applied directly, the same way a loaded `app.manifest.ts`'s default export would be
  if (typeof manifest === 'function') {
    const result = await manifest(env, { base });
    return mergeAppManifests(base, result ?? {});
  }
  try {
    return (await loadAppManifest(env, { base, file: manifest })).manifest;
  } catch (err) {
    // an explicitly requested manifest that's missing is a real error; only the default lookup falls back
    if (err instanceof FileNotFoundError && !manifest) return base;
    throw err;
  }
};

/**
 * Loads `app.config(.*)?` (or applies an inline {@link AppConfigFn}), falling back to an empty
 * config when none exists — mirrors `ffc app build`'s own fallback so a test env matches a real
 * build with zero config file.
 */
const resolveConfig = async (
  env: RuntimeEnv,
  config?: string | AppConfigFn,
): Promise<ApiAppConfig> => {
  // an inline function is applied directly, the same way a loaded `app.config.ts`'s default export would be
  if (typeof config === 'function') {
    const result = await config(env, { base: { environment: {} } });
    return ApiAppConfigSchema.parse(result ?? { environment: {} });
  }
  try {
    return (await loadAppConfig(env, { file: config })).config;
  } catch (err) {
    // an explicitly requested config that's missing is a real error; only the default lookup falls back
    if (err instanceof FileNotFoundError && !config) return { environment: {} };
    throw err;
  }
};

export default resolveAppTestEnv;
