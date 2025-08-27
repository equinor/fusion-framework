import type { PackageJson } from 'type-fest';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import { assert, assertObject } from '../utils/assert.js';
import { resolveAnnotations } from '../utils/resolve-annotations.js';
import { resolveEntryPoint } from '../utils/resolve-source-entry-point.js';

import { resolveRepoFromPackage } from '../utils/resolve-package-repo.js';
import { resolveGitRemoteUrl } from '../utils/resolve-git-remote-url.js';
import { resolveGitCommitSha } from '../utils/resolve-git-commit-sha.js';
import { ASSET_EXTENSIONS } from '../static.js';
import type { PortalManifest } from './portal-manifest.js';
import { PortalManifestSchema } from './portal-manifest.schema.js';

/**
 * Resolves the appropriate entry point for a portal based on the current runtime environment.
 *
 * - In production or preview environments, it prefers the compiled entry point specified by
 *   the `main` or `module` fields in the provided `package.json`, falling back to `'dist/bundle.js'` if neither is present.
 * - In development, it uses the source entry point for improved debugging.
 *
 * @param env - The runtime environment configuration, including command and preview status.
 * @param packageJson - The parsed contents of the package's `package.json` file.
 * @returns The resolved entry point path as a string.
 */
const resolvePortalEntryPoint = (env: RuntimeEnv, packageJson: PackageJson): string => {
  // Use compiled entry point when building for production or preview environments
  if (env.command === 'build' || env.isPreview) {
    // Prefer 'main', then 'module', then fallback to default bundle path
    return packageJson.main || packageJson.module || 'dist/bundle.js';
  }
  // Use source entry point during development for better debugging
  return resolveEntryPoint(env.root);
};

/**
 * Creates a `PortalManifest` object from the provided `package.json` data and runtime environment.
 *
 * This function validates the input package information, determines the appropriate entry point,
 * extracts metadata such as the app key, version, and repository information, and constructs a manifest
 * object suitable for use in portal deployment and development workflows.
 *
 * @param env - The runtime environment, containing information such as the current command (e.g., 'build', 'dev').
 * @param packageJson - The parsed `package.json` object for the portal package, expected to include at least `name` and `version`.
 * @returns A fully constructed `PortalManifest` object containing metadata, build information, and asset configuration.
 *
 * @throws Will throw an error if `packageJson` is not a valid object or is missing required fields.
 *
 * @remarks
 * - Maintainers: This function is the canonical way to generate a portal manifest from package metadata.
 * - The manifest structure is tightly coupled to the portal build and deployment pipeline.
 * - If you add new fields to the manifest, update this function and its documentation accordingly.
 */
export const createPortalManifestFromPackage = (
  env: RuntimeEnv,
  packageJson: PackageJson,
): PortalManifest => {
  // Validate that packageJson is a valid object and contains required fields
  assertObject(packageJson, 'expected packageJson');
  assert(packageJson.name, 'expected [name] in packageJson');
  assert(packageJson.version, 'expected [version] in packageJson');

  // Determine the entry point for the portal based on environment (prod/dev)
  const templateEntry = resolvePortalEntryPoint(env, packageJson);

  // Extract portal id from package name by removing the scope and leading @
  // Example: '@scope/portal-name' -> 'portal-name'
  const name = packageJson.name.replace(/^@|\w.*\//gm, '');
  const version = packageJson.version;

  // Only set assetPath when not building for production (used for dev/preview)
  const assetPath = env.command === 'build' ? undefined : '/@fs';

  // Attempt to resolve GitHub repo from package, fallback to local git remote
  const githubRepo = resolveRepoFromPackage(packageJson) ?? resolveGitRemoteUrl();

  // Construct the portal manifest object with all required fields
  const manifest = {
    name,
    displayName: packageJson.name,
    description: packageJson.description || '',
    build: {
      templateEntry,
      schemaEntry: 'portal.schema.json',
      assetPath,
      githubRepo,
      version,
      timestamp: new Date().toISOString(),
      commitSha: resolveGitCommitSha(),
      annotations: {
        ...resolveAnnotations(),
        // ...packageJson.annotations ?? {}
      },
      projectPage: packageJson.homepage,
      allowedExtensions: ASSET_EXTENSIONS.map((ext) => `.${ext}`),
    },
  };

  // Validate manifest against schema and throw if invalid
  const parsed = PortalManifestSchema.safeParse(manifest);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `- ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(['Invalid portal manifest generated from package.json:', details].join('\n'));
  }
  return parsed.data as PortalManifest;
};
