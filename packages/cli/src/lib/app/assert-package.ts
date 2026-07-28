import { assert } from '@equinor/fusion-framework-cli/utils';
import type { AppPackageJson } from './define-app-package.js';
import { resolveAppKey } from './resolve-app-key.js';
import { resolveEntryPoint } from './resolve-app-entry-point-impl.js';

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
