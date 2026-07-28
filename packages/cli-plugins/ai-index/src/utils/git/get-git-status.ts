import { resolveProjectRoot } from './resolve-project-root.js';
import { getGit } from './get-git.js';

/**
 * Retrieves a summary of the current git working-tree status.
 *
 * Returns the current branch name, abbreviated HEAD commit, and counts of
 * staged / unstaged changes. Useful for informational output in CLI commands.
 *
 * @param cwd - Working directory for git operations. Defaults to `process.cwd()`.
 * @returns An object with branch, commit, and file-change counts.
 * @throws {Error} If the working directory is not inside a git repository or
 *   the git client cannot be initialised.
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
  // Status can only be reported when cwd is inside a git repository
  if (!projectRoot) {
    throw new Error('Not in a git repository');
  }

  const { git } = getGit(cwd) ?? {};
  // Fail fast if the git client could not be created for this repository
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
