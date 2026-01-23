import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import type { ConsoleLogger } from './utils/index.js';

import { resolveAppManifest } from './helpers/resolve-app-manifest.js';
import { resolveProjectPackage } from './helpers/resolve-project-package.js';

/**
 * Options for resolving the application manifest.
 *
 * This type defines the shape of the options object accepted by
 * {@link loadAppManifest}. It allows for optional logging, environment overrides,
 * a custom manifest file path, and an optional snapshot version to override the
 * package.json version.
 *
 * @public
 */
export type ResolveAppManifestOptions = {
  /**
   * Logger instance for outputting progress and debug information (optional).
   */
  log?: ConsoleLogger | null;
  /**
   * Path to a specific manifest file to resolve (optional).
   */
  manifest?: string;
  /**
   * Partial runtime environment overrides (optional).
   */
  env?: Partial<RuntimeEnv>;
  /**
   * Optional snapshot version to use instead of package.json version.
   * If provided, this version will be used in the manifest build metadata
   * without modifying package.json.
   */
  snapshot?: boolean | string;
};

/**
 * Loads and resolves the application manifest based on the provided options.
 *
 * This function resolves the app package, sets up the runtime environment, and loads the manifest.
 * If a snapshot version is provided, it will be used in the manifest build metadata instead of
 * the package.json version, without modifying package.json.
 * Logging is supported for debugging and progress tracking. Returns the manifest, package, and environment.
 *
 * @param options - The options for resolving the application manifest.
 * @returns An object containing the resolved manifest, package, and runtime environment.
 * @throws Will throw an error if resolving the application package or manifest fails.
 * @public
 */
export const loadAppManifest = async (options: ResolveAppManifestOptions) => {
  const { log } = options ?? {};

  // Resolve the application's package.json for root and metadata
  const pkg = await resolveProjectPackage(log);

  log?.debug('package', pkg);
  // Setup the runtime environment for manifest resolution
  const env: RuntimeEnv = {
    command: 'build',
    mode: process.env.NODE_ENV ?? 'production',
    root: pkg.root,
    ...options?.env, // Allow overrides from options
  };

  log?.debug('env:', env);

  // Resolve the application manifest using the environment and manifest path
  const manifest = await resolveAppManifest(env, pkg, {
    log,
    manifestPath: options?.manifest,
    snapshot: options?.snapshot,
  });

  log?.debug('manifest:', manifest);

  // Return the resolved manifest, package, and environment for further use
  return { manifest, pkg, env };
};

// Export as default for compatibility with import patterns
export default loadAppManifest;
