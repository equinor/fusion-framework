/**
 * Package information from npm registry
 */
export interface PackageInfo {
  /** Package name */
  name: string;
  /** Latest version from dist-tags */
  latest: string;
  /** All available versions */
  versions: string[];
  /** Distribution tags */
  'dist-tags': Record<string, string>;
  /** Package description */
  description?: string;
  /** Package homepage */
  homepage?: string;
  /** Package repository */
  repository?: {
    type: string;
    url: string;
  };
  /** Package author */
  author?: string | { name: string; email?: string; url?: string };
  /** Package license */
  license?: string;
  /** Package keywords */
  keywords?: string[];
  /** Package dependencies */
  dependencies?: Record<string, string>;
  /** Package dev dependencies */
  devDependencies?: Record<string, string>;
  /** Package peer dependencies */
  peerDependencies?: Record<string, string>;
}

/**
 * Fetches complete package information from npm registry.
 *
 * This function retrieves all available metadata for a package including
 * version information, dependencies, and package details. It performs
 * validation to ensure the package exists and has a valid latest version.
 *
 * @param packageName - The name of the package to fetch (e.g., "@equinor/fusion-framework")
 * @param registry - The npm registry URL (defaults to https://registry.npmjs.org)
 * @returns Promise resolving to complete package information
 * @throws {Error} If the package cannot be found, fetched, or has invalid data
 *
 * @example
 * ```typescript
 * // Fetch package info for a scoped package
 * const info = await fetchPackageInfo('@equinor/fusion-framework');
 * console.log(`Latest version: ${info.latest}`);
 *
 * // Fetch from custom registry
 * const info = await fetchPackageInfo('my-package', 'https://my-registry.com');
 * ```
 */
export async function fetchPackageInfo(
  packageName: string,
  registry = 'https://registry.npmjs.org',
): Promise<PackageInfo> {
  try {
    // Make HTTP request to npm registry API
    const response = await fetch(`${registry}/${packageName}`);
    // Registry errors should surface as a clear, contextual failure
    if (!response.ok) {
      throw new Error(`Failed to fetch package info for ${packageName}: ${response.statusText}`);
    }

    // Parse JSON response from registry
    const data = await response.json();

    // Validate that we received valid package data
    if (!data.name) {
      throw new Error(`Invalid package data received for ${packageName}`);
    }

    // Extract latest version from dist-tags (required for package resolution)
    const latestVersion = data['dist-tags']?.latest;
    // A package without dist-tags.latest can't be resolved
    if (!latestVersion) {
      throw new Error(`No latest version found for package ${packageName}`);
    }

    // Transform registry data to our PackageInfo interface
    return {
      name: data.name,
      latest: latestVersion,
      versions: Object.keys(data.versions || {}),
      'dist-tags': data['dist-tags'] || {},
      description: data.description,
      homepage: data.homepage,
      repository: data.repository,
      author: data.author,
      license: data.license,
      keywords: data.keywords,
      dependencies: data.dependencies,
      devDependencies: data.devDependencies,
      peerDependencies: data.peerDependencies,
    };
  } catch (error) {
    // Wrap any errors with context about the failed operation
    throw new Error(
      `Failed to fetch package info for ${packageName}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

