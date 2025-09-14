import { join } from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Checks if a directory exists and is a valid git repository.
 *
 * @param dir - Directory path to check.
 * @returns True if the directory exists and is a git repository, false otherwise.
 * @public
 */
export function isGitDir(dir: string): boolean {
  if (!existsSync(dir)) {
    return false;
  }

  // Check if .git directory exists (for regular git repos) or .git file exists (for worktrees)
  const gitDir = join(dir, '.git');
  return existsSync(gitDir);
}

export default isGitDir;
