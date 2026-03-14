import { dirname } from 'node:path';
import { readPackageUp, type PackageJson } from 'read-package-up';

/**
 * In-memory cache mapping package root directories to their parsed `package.json`.
 * Avoids repeated file-system lookups when processing many files from the same package.
 */
const packageMap = new Map<string, PackageJson>();

/**
 * Resolves the nearest `package.json` for a given file path.
 *
 * Uses an in-memory cache keyed by the package’s directory to avoid
 * redundant file-system lookups when many files share the same package.
 *
 * @param filePath - Absolute path to a source file.
 * @returns The parsed `PackageJson` if found, or `undefined`.
 *
 * @example
 * ```ts
 * const pkg = await resolvePackage('/repo/packages/cli/src/index.ts');
 * console.log(pkg?.name); // '@equinor/fusion-framework-cli'
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
