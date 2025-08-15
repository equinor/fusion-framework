import { loadPortalSchema } from '@equinor/fusion-framework-cli/portal';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import { pack } from './pack.js';
import { buildPortal } from './portal-build.js';

import type { ConsoleLogger } from './utils/ConsoleLogger.js';

/**
 * Options for bundling a portal into an archive for distribution or deployment.
 *
 * This type defines the optional parameters for the {@link bundlePortal} function, including
 * logger, manifest path, schema path, and archive name.
 *
 * @property log - Logger instance for outputting progress and debug information (optional).
 * @property manifest - Path to the portal manifest file (optional).
 * @property schema - Path to the portal schema file (optional).
 * @property archive - Name or path of the output archive file (optional).
 *
 * @public
 */
export type BundlePortalOptions = {
  log?: ConsoleLogger | null;
  manifest?: string;
  schema?: string;
  archive?: string;
};

/**
 * Bundles the portal into an archive for distribution or deployment.
 *
 * This function builds the portal, validates the manifest, loads the schema, and creates an archive containing
 * the portal manifest, schema, and metadata. Handles errors and logs progress for maintainability and debugging.
 *
 * @param options - Options for logger, manifest path, schema path, and archive name.
 * @returns An object containing the archive path, portal manifest, and schema.
 * @throws If the manifest build config is missing or packaging fails.
 * @public
 */
export const bundlePortal = async (options: BundlePortalOptions) => {
  const { log, manifest } = options;

  // Setup a default runtime environment for the build
  const env: RuntimeEnv = {
    command: 'build',
    mode: process.env.NODE_ENV ?? 'production',
    environment: null,
    root: process.cwd(),
  };

  // Build the portal and retrieve the manifest and package info
  const { pkg, manifest: portalManifest } = await buildPortal({
    log,
    manifest,
  });

  // Ensure the manifest contains build configuration
  if (!portalManifest.build) {
    throw new Error('Manifest build config not found');
  }

  // Load the portal schema for validation and inclusion in the archive
  const schemaResult = await loadPortalSchema(env, { file: options?.schema });
  log?.debug('Schema:', schemaResult);

  // Create the archive with the portal manifest, schema, and metadata
  const result = await pack(pkg, {
    log,
    archive: options?.archive,
    content: {
      'portal-template-manifest.json': JSON.stringify(portalManifest.build, null, 2),
      'portal.schema.json': JSON.stringify(schemaResult.schema, null, 2),
      'metadata.json': JSON.stringify({
        name: portalManifest.name,
        version: portalManifest.build.version,
      }),
    },
  }).catch((error) => {
    // Log and exit if packaging fails
    log?.error('Failed to create package:', error);
    process.exit(1);
  });
  // Return the archive path, manifest, and schema for further use
  return {
    archive: result,
    manifest: portalManifest,
    schema: schemaResult.schema,
  };
};
