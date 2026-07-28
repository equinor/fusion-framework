import { simpleGit, type SimpleGit } from 'simple-git';

import { resolveProjectRoot } from './resolve-project-root.js';

const gitCache = new Map<string, SimpleGit>();

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
  // Only build/cache a client when the file is inside a git repository
  if (gitRepoPath) {
    // Reuse an existing client for this repo root instead of spawning a new one
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
