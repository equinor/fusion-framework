import type { PackageJson } from 'type-fest';
import type { AppManifest } from '@equinor/fusion-framework-module-app';

import { assert, assertObject } from '../utils/assert.js';
import { resolveEntryPoint } from '../utils/resolve-source-entry-point.js';
import { resolveRepoFromPackage } from '../utils/resolve-package-repo.js';
import { resolveGitRemoteUrl } from '../utils/resolve-git-remote-url.js';
import { resolveGitCommitSha } from '../utils/resolve-git-commit-sha.js';
import { resolveAnnotations } from '../utils/resolve-annotations.js';
import { ASSET_EXTENSIONS } from '../static.js';

import type { RuntimeEnv } from '../types.js';

/**
 * Resolves the entry point for the application based on the environment and package.json.
 *
 * Uses the compiled entry point for production/preview builds, otherwise uses the source entry point.
 *
 * @param env - The runtime environment.
 * @param packageJson - The application's package.json object.
 * @returns The resolved entry point path as a string.
 */
const resolveAppEntryPoint = (env: RuntimeEnv, packageJson: PackageJson): string => {
  // use compiled entry point when building for production or preview
  if (env.command === 'build' || env.isPreview) {
    return packageJson.main || packageJson.module || 'dist/app-bundle.js';
  }
  // use source entry point when developing
  return resolveEntryPoint(env.root);
};

/**
 * Creates an AppManifest object from the given runtime environment and package.json.
 *
 * This function extracts and normalizes manifest fields, resolves the entry point, asset path,
 * and repository information, and includes build metadata. It is the main entry for generating
 * a manifest for Fusion Framework applications.
 *
 * @param env - The runtime environment.
 * @param packageJson - The application's package.json object.
 * @returns The generated AppManifest object.
 * @throws If required fields are missing in packageJson.
 * @public
 */
export const createAppManifestFromPackage = (
  env: RuntimeEnv,
  packageJson: PackageJson,
): AppManifest => {
  // Validate input objects
  assertObject(packageJson, 'expected packageJson');
  assert(packageJson.name, 'expected [name] in packageJson');
  assert(packageJson.version, 'expected [version] in packageJson');

  // Resolve the entry point for the app
  const entryPoint = resolveAppEntryPoint(env, packageJson);

  // Extract appKey from package name by removing the scope and leading @
  // This ensures a normalized, unique key for the app
  const appKey = packageJson.name.replace(/^@|\w.*\//gm, '');
  const version = packageJson.version;
  const assetPath = env.command === 'build' ? undefined : `/bundles/apps/${appKey}@${version}`;

  // Try to resolve the GitHub repo from package or git config
  const githubRepo = resolveRepoFromPackage(packageJson) ?? resolveGitRemoteUrl();

  // Return the manifest object, using satisfies for type safety
  return {
    appKey,
    displayName: packageJson.name,
    description: packageJson.description || '',
    keywords: packageJson.keywords,
    type: 'standalone',
    build: {
      entryPoint,
      assetPath,
      githubRepo,
      version,
      timestamp: new Date().toISOString(), // Build timestamp for traceability
      commitSha: resolveGitCommitSha(), // Current git commit SHA for traceability
      annotations: resolveAnnotations(), // Resolve any build annotations
      projectPage: packageJson.homepage,
      allowedExtensions: ASSET_EXTENSIONS.map(
        // TODO: @jaysencpp, this is just 🫤, extensions should not require leading dot
        (ext) => `.${ext}`,
      ),
    },
  } satisfies AppManifest;
};
