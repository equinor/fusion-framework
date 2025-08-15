import type { PackageJson } from 'type-fest';

/**
 * Resolves the GitHub repository URL from a given `package.json` object.
 *
 * @param pkg - The `package.json` object to extract the repository information from.
 * @returns The GitHub repository URL as a string.
 * @throws Will throw an error if the `package.json` does not contain a repository field.
 */
export const resolveRepoFromPackage = (pkg: PackageJson): string | undefined => {
  if (pkg.repository) {
    return typeof pkg.repository === 'string' ? pkg.repository : pkg.repository.url;
  }
  return undefined;
};
