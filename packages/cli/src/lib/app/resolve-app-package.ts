import { dirname } from 'node:path';
import { readPackageUp, type NormalizeOptions as ResolveAppPackageOptions } from 'read-package-up';

import type { AppPackageJson } from './app-package.js';

/**
 * Structure representing a resolved application package, including its path and root directory.
 */
export type ResolvedAppPackage = {
  packageJson: AppPackageJson;
  path: string;
  root: string;
};

/**
 * Resolves the application package by searching for the nearest `package.json` file.
 *
 * This function uses `read-package-up` to traverse up the directory tree and find the closest package.json.
 * It returns the package contents, its path, and the root directory.
 *
 * @param options - Optional parameters to customize the search behavior.
 * @returns A promise that resolves to the found package information.
 * @throws Will throw an error if the `package.json` file is not found.
 */
export const resolveAppPackage = async (
  options?: ResolveAppPackageOptions,
): Promise<ResolvedAppPackage> => {
  // Attempt to find the nearest package.json using read-package-up.
  const pkg = await readPackageUp(options);
  // No package.json means there's nothing valid to resolve
  if (!pkg) {
    // Throw if no package.json is found in the directory tree.
    throw Error('failed to find package.json');
  }
  // Return the resolved package, including its root directory.
  return { ...pkg, root: dirname(pkg.path) } as ResolvedAppPackage;
};

// Export the main package resolver as the default export for convenience.
export default resolveAppPackage;
