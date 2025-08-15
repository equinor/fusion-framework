import { FileNotFoundError } from '@equinor/fusion-imports';

import { loadAppManifest, createAppManifestFromPackage } from '@equinor/fusion-framework-cli/app';

import type { RuntimeEnv, ResolvedPackage } from '@equinor/fusion-framework-cli/lib';

import type { ConsoleLogger } from '../utils/index.js';
import { chalk, formatPath } from '../utils/format.js';

/**
 * Resolves the application manifest for a given package and environment.
 * Attempts to load a manifest file if specified, otherwise falls back to generating a manifest from package.json.
 * Handles logging for progress, success, and error states.
 *
 * @param env - The runtime environment context.
 * @param pkg - The resolved package information.
 * @param options - Optional logger and manifest path.
 * @returns The resolved application manifest object.
 * @throws If the manifest file is explicitly requested but not found, or if another error occurs.
 */
export const resolveAppManifest = async (
  env: RuntimeEnv,
  pkg: ResolvedPackage,
  options?: {
    log?: ConsoleLogger | null;
    manifestPath?: string;
  },
) => {
  // Generate a base manifest from the package.json as a fallback/default.
  const baseManifest = createAppManifestFromPackage(env, pkg.packageJson);

  try {
    // Attempt to load the manifest file, if provided.
    options?.log?.start('loading application package...');
    const { manifest, path } = await loadAppManifest(env, {
      base: baseManifest,
      file: options?.manifestPath,
    });

    if (!manifest.build) {
      throw new Error(
        `Application manifest for ${manifest.appKey} does not contain build information, please check the manifest file.`,
      );
    }

    if (env.command === 'serve') {
      // Only set assetPath when not building for production
      // This helps with local development and preview environments
      manifest.build.assetPath = `/bundles/apps/${manifest.appKey}/${manifest.build.version}`;
    }

    // Successfully loaded manifest from file.
    options?.log?.succeed('generated manifest from', formatPath(path, { relative: true }));
    return manifest;
  } catch (err) {
    // Handle missing manifest file scenario.
    if (err instanceof FileNotFoundError) {
      if (options?.manifestPath) {
        // Manifest file was explicitly requested but not found.
        const error = new Error(
          `Failed to load manifest file ${formatPath(options.manifestPath)}, please check the path.`,
          { cause: err },
        );
        options?.log?.fail(error.message);
        throw error;
      }
      // No manifest file specified; fallback to base manifest.
      options?.log?.succeed(
        chalk.dim('no local manifest config applied, using default generated from package'),
      );
      return baseManifest;
    }
    // Unexpected error occurred during manifest resolution.
    options?.log?.fail(
      `failed to resolve application manifest ${
        options?.manifestPath ? formatPath(options?.manifestPath) : ''
      }`,
    );
    throw err;
  }
};
