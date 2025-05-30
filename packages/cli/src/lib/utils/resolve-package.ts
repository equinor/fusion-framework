import { dirname } from 'node:path';

import {
  readPackageUp,
  type PackageJson,
  type NormalizeOptions as ResolvePackageOptions,
} from 'read-package-up';

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
  const pkg = await readPackageUp(options);
  if (!pkg) {
    throw Error('failed to find package.json');
  }
  return { ...pkg, root: dirname(pkg.path) } as ResolvedPackage;
};

export default resolvePackage;
