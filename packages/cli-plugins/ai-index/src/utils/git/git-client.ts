import { simpleGit, type SimpleGit } from 'simple-git';
import { findUpSync } from 'find-up';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const gitCache = new Map<string, SimpleGit>();

/**
 * Resolve the project root (git repository root) for a given file path
 * @param filePath - File path to resolve from
 * @returns Project root path or undefined if not in a git repository
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
 * Get or create a SimpleGit instance for a given file path
 * Uses caching to avoid creating multiple instances for the same repository
 * @param filePath - File path to get git instance for
 * @returns Git instance and repository path, or undefined if not in a git repository
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
