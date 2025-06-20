import { execSync } from 'node:child_process';

/**
 * Resolves the Git commit SHA for a given reference.
 *
 * @param ref - The Git reference to resolve. Defaults to 'HEAD' if not provided.
 * @returns The resolved Git commit SHA as a string, or `undefined` if the command fails.
 *
 * @remarks
 * This function uses the `git rev-parse` command to determine the commit SHA.
 * Ensure that the function is executed in a valid Git repository context.
 *
 * @throws Will throw an error if the `git` command fails or is not available.
 */
export const resolveGitCommitSha = (ref = 'HEAD'): string | undefined => {
  try {
    return execSync(`git rev-parse ${ref}`).toString().trim();
  } catch (error) {
    // most likely due to not being in a git repository or invalid ref
    return undefined; // Return undefined if the command fails or ref is not valid
  }
};

export default resolveGitCommitSha;
