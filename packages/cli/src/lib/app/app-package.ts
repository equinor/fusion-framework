import type { PackageJson } from 'read-package-up';

import type { AppManifest } from '@equinor/fusion-framework-module-app';

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

