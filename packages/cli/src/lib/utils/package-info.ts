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

/**
 * Fetches only the latest version of a package from npm registry.
 *
 * This is a convenience function that retrieves only the latest version
 * string without the overhead of fetching complete package metadata.
 * Useful for simple version checks and dependency resolution.
 *
 * @param packageName - The name of the package to fetch (e.g., "@equinor/fusion-framework")
 * @param registry - The npm registry URL (defaults to https://registry.npmjs.org)
 * @returns Promise resolving to the latest version string (e.g., "1.0.0")
 * @throws {Error} If the package cannot be found or fetched
 *
 * @example
 * ```typescript
 * // Get latest version for dependency resolution
 * const version = await fetchLatestVersion('@equinor/fusion-framework');
 * console.log(`Latest version: ${version}`);
 * ```
 */
export async function fetchLatestVersion(
  packageName: string,
  registry = 'https://registry.npmjs.org',
): Promise<string> {
  // Delegate to fetchPackageInfo and extract only the latest version
  const packageInfo = await fetchPackageInfo(packageName, registry);
  return packageInfo.latest;
}

/**
 * Fetches multiple packages' information in parallel for better performance.
 *
 * This function efficiently retrieves package information for multiple packages
 * simultaneously, using Promise.allSettled to handle individual failures gracefully.
 * Failed packages are silently excluded from the results.
 *
 * @param packageNames - Array of package names to fetch (e.g., ["@equinor/fusion-framework", "react"])
 * @param registry - The npm registry URL (defaults to https://registry.npmjs.org)
 * @returns Promise resolving to a map of package names to their information
 *
 * @example
 * ```typescript
 * // Fetch multiple packages for dependency analysis
 * const packages = await fetchMultiplePackageInfo([
 *   '@equinor/fusion-framework',
 *   'react',
 *   'typescript'
 * ]);
 *
 * // Check which packages were successfully fetched
 * console.log(`Fetched ${Object.keys(packages).length} packages`);
 * ```
 */
export async function fetchMultiplePackageInfo(
  packageNames: string[],
  registry = 'https://registry.npmjs.org',
): Promise<Record<string, PackageInfo>> {
  const results = {} as Record<string, PackageInfo>;

  // Create promises for all packages to fetch them in parallel
  const promises = packageNames.map(async (packageName) => {
    try {
      const packageInfo = await fetchPackageInfo(packageName, registry);
      return { packageName, packageInfo };
    } catch (error) {
      // Return null for failed packages - they'll be filtered out later
      return null;
    }
  });

  // Wait for all promises to settle (both success and failure)
  const settledPromises = await Promise.allSettled(promises);

  // Process results and build the final map
  for (const result of settledPromises) {
    if (result.status === 'fulfilled' && result.value) {
      const { packageName, packageInfo } = result.value;
      results[packageName] = packageInfo;
    }
  }

  return results;
}
