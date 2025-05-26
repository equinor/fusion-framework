import type { RuntimeEnv } from '../lib';
import type { ConsoleLogger } from './utils';

import { resolveAppManifest } from './helpers/resolve-app-manifest.js';
import { resolveAppPackage } from './helpers/resolve-project-package.js';

/**
 * Options for resolving the application manifest.
 *
 * This type defines the shape of the options object accepted by
 * {@link loadAppManifest}. It allows for optional logging, environment overrides,
 * and a custom manifest file path.
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
};

/**
 * Loads and resolves the application manifest based on the provided options.
 *
 * This function resolves the app package, sets up the runtime environment, and loads the manifest.
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
  const pkg = await resolveAppPackage(log);

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
  });

  log?.debug('manifest:', manifest);

  // Return the resolved manifest, package, and environment for further use
  return { manifest, pkg, env };
};

// Export as default for compatibility with import patterns
export default loadAppManifest;
