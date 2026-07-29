import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { findUpSync } from 'find-up';

/**
 * Resolves the git repository root for a given file path.
 *
 * Walks up the directory tree looking for a `.git` directory or file
 * (to support worktrees) and returns the enclosing directory.
 *
 * @param filePath - Absolute file or directory path to resolve from.
 * @returns Absolute path to the repository root, or `undefined` if not inside a git repo.
 */
export const resolveProjectRoot = (filePath: string): string | undefined => {
  // if we are in the root of the git repository, return the root
  if (existsSync(join(filePath, '.git'))) {
    return filePath;
  }
  const gitRepoPath = findUpSync('.git', { cwd: dirname(filePath), type: 'both' });
  const projectRoot = gitRepoPath?.replace(/\.git$/, '');
  return projectRoot;
};
