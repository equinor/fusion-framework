import type { PackageInfo } from './package-info.js';
import { fetchPackageInfo } from './package-info.js';

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
    // Only include packages that were fetched successfully
    if (result.status === 'fulfilled' && result.value) {
      const { packageName, packageInfo } = result.value;
      results[packageName] = packageInfo;
    }
  }

  return results;
}
