import { dirname } from 'node:path';

import {
  readPackageUp,
  type PackageJson,
  type NormalizeOptions as ResolvePackageOptions,
} from 'read-package-up';

import normalizePackageData from 'normalize-package-data'; // Correct import for normalize-package-data

export type ResolvedPackage = {
  packageJson: PackageJson;
  path: string;
  root: string;
};

/**
 * Resolves the application package by searching for the nearest `package.json` file.
 *
 * @param options - Optional parameters to customize the search behavior.
 * @returns A promise that resolves to the found package information.
 * @throws Will throw an error if the `package.json` file is not found.
 */
export const resolvePackage = async (options?: ResolvePackageOptions): Promise<ResolvedPackage> => {
  const pkg = await readPackageUp({ ...options, normalize: false });
  if (!pkg) {
    throw new Error('failed to find package.json');
  }
  // normalizePackageData mutates its argument and returns void, so clone first
  const normalizedPackageJson = { ...pkg.packageJson };
  normalizePackageData(normalizedPackageJson);
  const packageJson = { ...normalizedPackageJson, version: pkg.packageJson.version };
  return {
    packageJson,
    path: pkg.path,
    root: dirname(pkg.path),
  } as ResolvedPackage;
};

export default resolvePackage;
