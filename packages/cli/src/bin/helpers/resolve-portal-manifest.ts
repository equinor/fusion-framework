import { FileNotFoundError } from '@equinor/fusion-imports';

import type { ResolvedPackage, RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import {
  loadPortalManifest,
  createPortalManifestFromPackage,
  type PortalManifest,
} from '@equinor/fusion-framework-cli/portal';

import type { ConsoleLogger } from '../utils/index.js';
import { chalk, formatPath } from '../utils/format.js';

/**
 * Resolves the portal manifest for a given runtime environment and package.
 *
 * This function attempts to load a portal manifest, optionally merging it with a base manifest
 * generated from the provided package's package.json. If a manifest file is not found and a
 * manifest path was specified, an error is thrown. Otherwise, it falls back to the base manifest.
 * Logging is performed at various stages if a logger is provided.
 *
 * @typeParam T - The shape of the portal manifest, extending Partial<PortalManifest>.
 * @param env - The runtime environment context.
 * @param pkg - The resolved package containing package.json metadata.
 * @param options - Optional parameters.
 * @param options.log - Optional logger for progress and error reporting.
 * @param options.manifestPath - Optional path to a specific manifest file.
 * @param options.base - Optional base manifest to merge with the loaded manifest.
 * @returns A promise that resolves to the loaded or generated portal manifest.
 * @throws {Error} If the manifest file is not found at the specified path or if another error occurs during loading.
 */
export const resolvePortalManifest = async <T extends PortalManifest>(
  env: RuntimeEnv,
  pkg: ResolvedPackage,
  options?: {
    log?: ConsoleLogger | null;
    manifestPath?: string;
    base?: Partial<T>;
  },
) => {
  // Generate a base manifest from the package.json as a fallback/default
  const baseManifest = createPortalManifestFromPackage(env, pkg.packageJson) as T;

  try {
    // Log the start of the manifest loading process, if logger is provided
    options?.log?.start('loading manifest...');

    // Attempt to load the portal manifest, merging with the base manifest
    const importResult = await loadPortalManifest<T>(env, { base: baseManifest });

    // Log success with the path of the loaded/generated manifest
    options?.log?.succeed(
      'generated manifest from',
      formatPath(importResult.path, { relative: true }),
    );

    // Return the loaded or generated manifest
    return importResult.manifest;
  } catch (err) {
    // Handle the case where the manifest file is not found
    if (err instanceof FileNotFoundError) {
      // If a specific manifest path was requested, treat as an error
      if (options?.manifestPath) {
        const error = new Error(
          `Failed to load manifest file ${formatPath(options.manifestPath)}, please check the path.`,
          { cause: err },
        );
        // Log the failure and rethrow the error
        options?.log?.fail(error.message);
        throw error;
      }
      // If no manifest path was specified, fall back to the base manifest and log this outcome
      options?.log?.succeed(
        chalk.dim('no local manifest config applied, using default generated from package'),
      );
      return baseManifest;
    }
    // Log any other errors encountered during manifest resolution
    options?.log?.fail(
      `failed to resolve application manifest ${
        options?.manifestPath ? formatPath(options?.manifestPath) : ''
      }`,
    );
    // Rethrow the error for upstream handling
    throw err;
  }
};
