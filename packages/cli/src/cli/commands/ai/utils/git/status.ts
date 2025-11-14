import { resolveProjectRoot, getGit } from './git-client.js';

/**
 * Get git status information for debugging
 * @param cwd - Working directory
 * @returns Git status information
 */
export const getGitStatus = async (
  cwd: string = process.cwd(),
): Promise<{
  branch: string;
  commit: string;
  hasChanges: boolean;
  stagedFiles: number;
  unstagedFiles: number;
}> => {
  const projectRoot = resolveProjectRoot(cwd);
  if (!projectRoot) {
    throw new Error('Not in a git repository');
  }

  const { git } = getGit(cwd) ?? {};
  if (!git) {
    throw new Error('Failed to initialize git client');
  }

  try {
    const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
    const commit = await git.revparse(['--short', 'HEAD']);

    const statusResult = await git.status();
    const stagedFiles = statusResult.staged.length;
    const unstagedFiles =
      statusResult.modified.length + statusResult.deleted.length + statusResult.not_added.length;

    return {
      branch: branch.trim(),
      commit: commit.trim(),
      hasChanges: stagedFiles > 0 || unstagedFiles > 0,
      stagedFiles,
      unstagedFiles,
    };
  } catch (error) {
    throw new Error(
      `Failed to get git status: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
