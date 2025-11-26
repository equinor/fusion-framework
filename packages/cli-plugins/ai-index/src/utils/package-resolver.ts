import { dirname } from 'node:path';
import { readPackageUp, type PackageJson } from 'read-package-up';

/**
 * Map of package base directories to package.json
 */
const packageMap = new Map<string, PackageJson>();

/**
 * Resolves which package a file path belongs to.
 * First checks the cache map, then uses read-package-up if no match found.
 *
 * @param filePath - Absolute or relative file path (e.g., '/path/to/packages/cli/src/index.ts')
 * @returns Package.json if found, undefined otherwise
 *
 * @example
 * ```ts
 * const packageJson = await resolvePackage('/path/to/packages/cli/src/index.ts');
 * ```
 */
export async function resolvePackage(filePath: string): Promise<PackageJson | undefined> {
  // Check cache: iterate through known package directories
  for (const packageRoot of packageMap.keys()) {
    if (filePath.startsWith(packageRoot)) {
      const packageJson = packageMap.get(packageRoot);
      if (packageJson) {
        return packageJson;
      }
    }
  }

  // Not in cache, resolve using read-package-up
  // readPackageUp expects a directory path, not a file path
  const dirPath = dirname(filePath);
  const result = await readPackageUp({ cwd: dirPath, normalize: false });

  if (result) {
    // Cache using the package directory (where package.json is located)
    const packageDir = dirname(result.path);
    packageMap.set(packageDir, result.packageJson);
  }

  return result?.packageJson;
}
