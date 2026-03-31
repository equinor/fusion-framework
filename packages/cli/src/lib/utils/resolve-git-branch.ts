import { execSync } from 'node:child_process';

/**
 * Resolves the current Git branch for the working tree.
 *
 * @returns The current branch name, or `undefined` when not in a Git repository
 *          or when HEAD is detached.
 */
export const resolveGitBranch = (): string | undefined => {
  try {
    const branch = execSync('git branch --show-current').toString().trim();
    return branch || undefined;
  } catch {
    return undefined;
  }
};

export default resolveGitBranch;
