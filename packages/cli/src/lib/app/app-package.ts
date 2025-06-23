import { existsSync } from 'node:fs';
import { dirname, relative } from 'node:path';

import {
  type PackageJson,
  readPackageUp,
  type NormalizeOptions as ResolveAppPackageOptions,
} from 'read-package-up';

import type { AppManifest } from '@equinor/fusion-framework-module-app';

import { assert } from '@equinor/fusion-framework-cli/utils';

/**
 * Extended type for application package.json, optionally including a manifest.
 */
export type AppPackageJson = PackageJson & {
  manifest?: AppManifest;
};

/**
 * Function type for defining a package, supporting both sync and async returns.
 */
type DefinePackageFn = () => AppPackageJson | Promise<AppPackageJson>;
/**
 * Type for a package definition, which can be an object or a function.
 */
type DefinePackageExporter = AppPackageJson | DefinePackageFn;

/**
 * Structure representing a resolved application package, including its path and root directory.
 */
export type ResolvedAppPackage = {
  packageJson: AppPackageJson;
  path: string;
  root: string;
};

/**
 * Defines the application package using the provided object.
 *
 * @param obj - The object representing the application package.
 * @returns The same object, typed as AppPackageJson.
 */
export function defineAppPackage(obj: AppPackageJson): AppPackageJson;

/**
 * Defines the application package using a function.
 *
 * @param fn - The function returning the application package.
 */
export function defineAppPackage(fn: DefinePackageFn): void;

// Implementation for defineAppPackage, returns the input as-is.
export function defineAppPackage(fnOrObject: DefinePackageExporter): DefinePackageExporter {
  // This function is intentionally a passthrough for both object and function types.
  return fnOrObject;
}

/**
 * Resolves the entry point of a given package.
 *
 * This function checks for common entry point fields in the package.json (entrypoint, main, module),
 * and falls back to typical source files if not found. It returns the first existing entry.
 *
 * @param packageJson - The package.json object to resolve from.
 * @param pkgPath - The path to the package.json file (used for relative resolution).
 * @returns The relative path to the resolved entry point.
 * @throws Will throw an error if no entry point can be resolved.
 */
export const resolveEntryPoint = (packageJson: PackageJson, pkgPath = ''): string => {
  // List of possible entry points, prioritized by common convention.
  const entrypoint = [
    packageJson.entrypoint,
    packageJson.main,
    packageJson.module,
    'src/index.ts',
    'src/index.tsx',
    'src/index.js',
    'src/index.jsx',
  ]
    // Filter out undefined/null values.
    .filter((x): x is string => !!x)
    // Map to relative paths from the package root.
    .map((x): string => relative(dirname(pkgPath), x))
    // Find the first entry that actually exists on disk.
    .find((entry) => existsSync(entry));

  // Assert that an entry point was found, otherwise throw.
  assert(entrypoint, 'failed to resolve entrypoint');

  return entrypoint;
};

/**
 * Resolves the application key from the given package.json object.
 *
 * This function strips any leading '@' or scope from the package name, returning a normalized key.
 *
 * @param packageJson - An object containing the 'name' property from the package.json.
 * @returns The resolved application key, which is the package name with any leading '@' or scope removed.
 * @throws Will throw an error if the 'name' property is not present in the packageJson.
 */
export const resolveAppKey = (packageJson: Pick<PackageJson, 'name'>) => {
  // Ensure the package has a name property.
  assert(packageJson.name, 'expected [name] in packageJson');
  // Remove leading '@' or scope from the name for normalization.
  return packageJson.name.replace(/^@|\w.*\//gm, '');
};

/**
 * Asserts the validity of a given package by resolving its application key and entry point.
 *
 * This function is useful for validating that a package is correctly structured and can be used by the framework.
 *
 * @param pkg - A partial representation of the application's package JSON.
 * @throws Will throw if the package is missing a valid name or entry point.
 */
export const assertPackage = (pkg: Partial<AppPackageJson>) => {
  // Validate that the package has a valid key and entry point.
  assert(resolveAppKey(pkg));
  assert(resolveEntryPoint(pkg as AppPackageJson));
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
  if (!pkg) {
    // Throw if no package.json is found in the directory tree.
    throw Error('failed to find package.json');
  }
  // Return the resolved package, including its root directory.
  return { ...pkg, root: dirname(pkg.path) } as ResolvedAppPackage;
};

// Export the main package resolver as the default export for convenience.
export default resolveAppPackage;
