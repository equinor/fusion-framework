import { fetchPackageInfo } from './fetch-package-info.js';

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
