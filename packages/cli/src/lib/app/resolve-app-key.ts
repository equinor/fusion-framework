import type { PackageJson } from 'read-package-up';
import { assert } from '@equinor/fusion-framework-cli/utils';

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
