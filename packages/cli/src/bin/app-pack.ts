import type { RuntimeEnv } from '../lib';
import { buildApplication } from './app-build';
import { pack } from './pack';

import type { ConsoleLogger } from './utils/ConsoleLogger';

/**
 * Options for bundling the application into an archive.
 *
 * This type defines the shape of the options object accepted by
 * {@link bundleApp}. It allows for optional logging, manifest path, and archive name.
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
};

/**
 * Bundles the application into an archive for distribution or deployment.
 *
 * This function builds the application, validates the manifest, and creates an archive containing
 * the app manifest and metadata. Handles errors and logs progress for maintainability and debugging.
 *
 * @param options - Options for logger, manifest path, and archive name.
 * @returns An object containing the archive path and the application manifest.
 * @throws If the manifest build config is missing or packaging fails.
 * @public
 */
export const bundleApp = async (options: BundleAppOptions) => {
  const { log, manifest } = options;

  // Setup a default runtime environment for the build
  const env: RuntimeEnv = {
    command: 'build',
    mode: process.env.NODE_ENV ?? 'production',
    environment: null,
    root: process.cwd(),
  };

  // Build the application and retrieve the manifest and package info
  const { pkg, manifest: appManifest } = await buildApplication({ log, manifest });

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
