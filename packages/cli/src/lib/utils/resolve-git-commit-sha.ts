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
export const resolveGitCommitSha = (ref = 'HEAD'): string => {
  return execSync(`git rev-parse ${ref}`).toString().trim();
};
