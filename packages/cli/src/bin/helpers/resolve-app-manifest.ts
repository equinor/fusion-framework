import { FileNotFoundError } from '@equinor/fusion-imports';
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { resolveSitemap } from '@equinor/fusion-framework-react-router/build';

import { loadAppManifest, createAppManifestFromPackage } from '@equinor/fusion-framework-cli/app';
import type { AppManifest } from '@equinor/fusion-framework-cli/app';

import type { RuntimeEnv, ResolvedPackage } from '@equinor/fusion-framework-cli/lib';

import type { ConsoleLogger } from '../utils/index.js';
import chalk from 'chalk';
import { formatPath } from '../utils/format-path.js';

/**
 * Adds the conventional DSL sitemap only when the manifest has no explicit routes.
 *
 * Older apps remain buildable without DSL routing. A missing default registry is
 * a warning; explicit paths, unreadable files and invalid registries remain errors.
 *
 * @param manifest - Loaded or package-generated manifest.
 * @param env - Application root and build environment.
 * @param log - CLI logger, falling back to the console for library callers.
 * @returns The manifest with a generated sitemap when a default registry exists.
 */
async function resolveDefaultRoutes(
  manifest: AppManifest,
  env: RuntimeEnv,
  log?: ConsoleLogger | null,
): Promise<AppManifest> {
  // Serialized entries, an empty array and null are deliberate author choices.
  if (manifest.routes !== undefined) return manifest;
  const root = env.root ?? process.cwd();
  try {
    await access(resolve(root, 'src/routes.ts'));
  } catch (error) {
    // Only absence of the conventional file is an optional-routing condition.
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
    (log ?? console).warn(
      'Missing DSL routing: no routes configured in the app manifest and src/routes.ts was not found. ' +
        'Continuing without a generated sitemap. Read more: ' +
        'https://equinor.github.io/fusion-framework/modules/react/router/route-sitemap.html',
    );
    return manifest;
  }
  // The discovered registry uses the same source-only resolver as explicit pointers.
  return { ...manifest, routes: await resolveSitemap({ root }) };
}

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
    snapshot?: boolean | string;
  },
): Promise<AppManifest> => {
  // Generate a base manifest from the package.json as a fallback/default.
  const baseManifest = createAppManifestFromPackage(env, pkg.packageJson, {
    snapshot: options?.snapshot,
  });

  try {
    // Attempt to load the manifest file, if provided.
    options?.log?.start('loading application package...');
    const { manifest, path } = await loadAppManifest(env, {
      base: baseManifest,
      file: options?.manifestPath,
    });

    // The manifest is unusable for serving/building without build info
    if (!manifest.build) {
      throw new Error(
        `Application manifest for ${manifest.appKey} does not contain build information, please check the manifest file.`,
      );
    }

    // Only set assetPath when not building for production
    if (env.command === 'serve') {
      // Only set assetPath when not building for production
      // This helps with local development and preview environments
      manifest.build.assetPath = `/bundles/apps/${manifest.appKey}/${manifest.build.version}`;
    }

    // Successfully loaded manifest from file.
    options?.log?.succeed('generated manifest from', formatPath(path, { relative: true }));
    return await resolveDefaultRoutes(manifest, env, options?.log);
  } catch (err) {
    // Handle missing manifest file scenario.
    if (err instanceof FileNotFoundError) {
      // Distinguish an explicitly-requested missing file from the default-lookup case
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
      return resolveDefaultRoutes(baseManifest, env, options?.log);
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
