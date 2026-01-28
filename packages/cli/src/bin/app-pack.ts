import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import { buildApplication } from './app-build.js';
import { pack } from './pack.js';

import type { ConsoleLogger } from './utils/ConsoleLogger.js';

/**
 * Options for bundling the application into an archive.
 *
 * This type defines the shape of the options object accepted by
 * {@link bundleApp}. It allows for optional logging, manifest path, archive name,
 * and an optional snapshot version to override the package.json version.
 *
 * @public
 */
export type BundleAppOptions = {
  /**
   * Logger instance for outputting progress and debug information (optional).
   */
  log?: ConsoleLogger | null;
  /**
   * Path to the application manifest file (optional).
   */
  manifest?: string;
  /**
   * Name or path of the output archive file (optional).
   */
  archive?: string;
  /**
   * Optional snapshot version to use instead of package.json version.
   * If provided, this version will be used in the manifest build metadata
   * without modifying package.json.
   */
  snapshot?: boolean | string;
};

/**
 * Bundles the application into an archive for distribution or deployment.
 *
 * This function builds the application, validates the manifest, and creates an archive containing
 * the app manifest and metadata. If a snapshot version is provided, it will be used in the bundle
 * metadata without modifying package.json. Handles errors and logs progress for maintainability and debugging.
 *
 * @param options - Options for logger, manifest path, archive name, and optional snapshot version.
 * @returns An object containing the archive path and the application manifest.
 * @throws If the manifest build config is missing or packaging fails.
 * @public
 */
export const bundleApp = async (options: BundleAppOptions) => {
  const { log, manifest, snapshot } = options;

  // Setup a default runtime environment for the build
  const env: RuntimeEnv = {
    command: 'build',
    mode: process.env.NODE_ENV ?? 'production',
    environment: null,
    root: process.cwd(),
  };

  // Build the application and retrieve the manifest and package info
  const { pkg, manifest: appManifest } = await buildApplication({
    env,
    log,
    manifest,
    snapshot,
  });

  // Ensure the manifest contains build configuration
  if (!appManifest.build) {
    throw new Error('Manifest build config not found');
  }

  // Create the archive with the app manifest and metadata
  const result = await pack(pkg, {
    log,
    archive: options?.archive,
    content: {
      'app-manifest.json': JSON.stringify(appManifest.build, null, 2),
      'metadata.json': JSON.stringify({
        appKey: appManifest.appKey,
        name: appManifest.appKey,
        version: appManifest.build.version,
      }),
    },
  }).catch((error) => {
    // Log and exit if packaging fails
    log?.error('Failed to create package:', error);
    process.exit(1);
  });
  // Return the archive path and manifest for further use
  return {
    archive: result,
    manifest: appManifest,
  };
};
