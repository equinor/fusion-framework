import { simpleGit, type SimpleGit } from 'simple-git';
import { findUpSync } from 'find-up';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const gitCache = new Map<string, SimpleGit>();

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

/**
 * Returns a cached `SimpleGit` instance scoped to the repository that
 * contains `filePath`.
 *
 * Instances are cached by repository root to avoid repeatedly spawning
 * new git processes for the same repo.
 *
 * @param filePath - Absolute file path to locate the repository for.
 * @returns An object containing the git client and the repository root path,
 *   or `undefined` when `filePath` is not inside a git repository.
 */
export const getGit = (
  filePath: string,
): { git: SimpleGit | undefined; gitRepoPath: string } | undefined => {
  const gitRepoPath = resolveProjectRoot(filePath);
  if (gitRepoPath) {
    if (!gitCache.has(gitRepoPath)) {
      gitCache.set(gitRepoPath, simpleGit(gitRepoPath));
    }
    return {
      git: gitCache.get(gitRepoPath),
      gitRepoPath,
    };
  }
  return undefined;
};
