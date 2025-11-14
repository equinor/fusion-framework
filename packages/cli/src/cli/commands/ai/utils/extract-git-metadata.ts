import { simpleGit, type SimpleGit } from 'simple-git';
import { findUpSync } from 'find-up';
import { dirname, join, relative } from 'node:path';
import { existsSync } from 'node:fs';

export type GitMetadata = Partial<{
  git_remote_url: string;
  git_commit_hash: string;
  git_commit_date: string;
  git_link: string;
}>;

/**
 * Git diff options for filtering changed files
 */
export interface GitDiffOptions {
  /** Enable diff-based file filtering */
  diff: boolean;
  /** Git reference to compare against (default: HEAD~1) */
  baseRef?: string;
  /** Working directory for git operations */
  cwd?: string;
}

const gitCache = new Map<string, SimpleGit>();

export const resolveProjectRoot = (filePath: string): string | undefined => {
  // if we are in the root of the git repository, return the root
  if (existsSync(join(filePath, '.git'))) {
    return filePath;
  }
  const gitRepoPath = findUpSync('.git', { cwd: dirname(filePath), type: 'both' });
  const projectRoot = gitRepoPath?.replace(/\.git$/, '');
  return projectRoot;
};

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

const generateGithubPermalink = (
  gitRemoteUrl: string,
  filePath: string,
  slug?: string,
): string | undefined => {
  const githubMatch = gitRemoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
  if (githubMatch) {
    const [, owner, repo] = githubMatch;
    return `https://github.com/${owner}/${repo}/blob/${slug ?? 'main'}/${filePath}`;
  }
  return undefined;
};

export const extractGitMetadata = async (filePath: string): Promise<GitMetadata | undefined> => {
  const { git, gitRepoPath: gitRepoRoot } = getGit(filePath) ?? {};
  if (!git || !gitRepoRoot) {
    console.log(444, 'no git repo root', filePath);
    return undefined;
  }
  const gitFilePath = relative(gitRepoRoot, filePath);
  const { latest } = await git.log({ file: gitFilePath, maxCount: 1 });
  const gitRemoteUrl = await git
    .getConfig('remote.origin.url')
    .then(({ value }) => value ?? undefined);
  const git_link = gitRemoteUrl ? generateGithubPermalink(gitRemoteUrl, gitFilePath) : undefined;
  return {
    git_link,
    git_commit_hash: latest?.hash,
    git_commit_date: latest?.date,
  };
};

/**
 * File change status
 */
export type FileChangeStatus = 'new' | 'modified' | 'removed';

/**
 * Changed file information
 */
export interface ChangedFile {
  /** Absolute file path */
  filepath: string;
  /** Change status: new, modified, or removed */
  status: FileChangeStatus;
}

/**
 * Get list of changed files using git diff with status
 * @param options - Git diff configuration options
 * @returns Array of changed files with their status
 */
export const getChangedFiles = async (options: GitDiffOptions): Promise<ChangedFile[]> => {
  const { diff, baseRef = 'HEAD~1', cwd = process.cwd() } = options;

  if (!diff) {
    return [];
  }

  const projectRoot = resolveProjectRoot(cwd);
  if (!projectRoot) {
    throw new Error('Not in a git repository. Cannot use --diff option.');
  }

  const { git } = getGit(cwd) ?? {};
  if (!git) {
    throw new Error('Failed to initialize git client');
  }

  try {
    // Get changes since baseRef with status (A=added, M=modified, D=deleted)
    try {
      const diffResult = await git.diff([`${baseRef}`, '--name-status']);
      const lines = diffResult.split('\n').filter((line) => line.trim() !== '');

      const changedFiles: ChangedFile[] = [];

      for (const line of lines) {
        // Match status and file path
        // Format: "A\tfile.ts" or "M\tfile.ts" or "D\tfile.ts"
        // Also handle renames: "R100\told.ts\tnew.ts"
        const match = line.match(/^([AMD])\s+(.+)$/);
        if (match) {
          const [, gitStatus, file] = match;
          const fullPath = `${projectRoot}/${file}`;

          let status: FileChangeStatus;
          if (gitStatus === 'A') {
            status = 'new';
          } else if (gitStatus === 'M') {
            status = 'modified';
          } else if (gitStatus === 'D') {
            status = 'removed';
          } else {
            // Skip unknown statuses (R=renamed, C=copied, etc.)
            continue;
          }

          changedFiles.push({ filepath: fullPath, status });
        }
      }

      return changedFiles;
    } catch {
      // Handle case where baseRef doesn't exist (e.g., first commit)
      console.warn(`⚠️  Warning: Git reference '${baseRef}' not found. Processing all files.`);
      return [];
    }
  } catch (error) {
    throw new Error(`Git diff failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Determine the git status of a file, including handling renames
 * Returns an array of ChangedFile objects - if the file was renamed, returns both old and new paths
 * @param filePath - Absolute file path to check
 * @returns Promise resolving to array of changed files (1 or 2 items if renamed)
 */
export const getFileStatus = async (filePath: string): Promise<ChangedFile[]> => {
  const { git, gitRepoPath } = getGit(filePath) ?? {};
  if (!git || !gitRepoPath) {
    // Not in a git repository, assume new
    return [{ filepath: filePath, status: 'new' }];
  }

  const gitFilePath = relative(gitRepoPath, filePath);
  // Normalize path separators for git commands (git uses forward slashes on all platforms)
  const normalizedGitFilePath = gitFilePath.replace(/\\/g, '/');

  try {
    // First check if file is tracked in git at the current path
    const isTracked = await git
      .raw(['ls-files', '--error-unmatch', normalizedGitFilePath])
      .then(() => true)
      .catch(() => false);

    if (isTracked) {
      // File is tracked at this path, it's modified
      return [{ filepath: filePath, status: 'modified' }];
    }

    // File is not tracked - quickly check if it's explicitly untracked
    // This is much faster than checking full status or history
    try {
      const fileStatusOutput = await git.raw(['status', '--porcelain', '--', normalizedGitFilePath]);
      const trimmed = fileStatusOutput.trim();

      if (trimmed.length > 0) {
        // If status shows ??, it's untracked (truly new)
        if (/^\?\?/.test(trimmed)) {
          return [{ filepath: filePath, status: 'new' }];
        }
      }
    } catch {
      // If status check fails, continue to rename/history checks
    }

    // File is not tracked and not explicitly untracked - check if it's a rename
    // Only do expensive checks if we haven't determined status yet
    try {
      // Get full git status to check for renames (only if needed)
      const statusOutput = await git.raw(['status', '--porcelain']);
      const lines = statusOutput.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        // Check for rename format: "R100\told.ts\tnew.ts"
        const renameMatch = line.match(/^R\d+\s+(.+?)\s+(.+)$/);
        if (renameMatch) {
          const [, oldPath, newPath] = renameMatch;
          const oldFullPath = join(gitRepoPath, oldPath);
          const newFullPath = join(gitRepoPath, newPath);

          // Check if the current file is the new path in a rename
          if (newFullPath === filePath) {
            return [
              { filepath: oldFullPath, status: 'removed' },
              { filepath: newFullPath, status: 'new' },
            ];
          }
        }

        // Check for copy format: "C100\told.ts\tnew.ts" (similar to rename)
        const copyMatch = line.match(/^C\d+\s+(.+?)\s+(.+)$/);
        if (copyMatch) {
          const [, , newPath] = copyMatch;
          const newFullPath = join(gitRepoPath, newPath);

          // For copies, the old file still exists, so only return the new one
          if (newFullPath === filePath) {
            return [{ filepath: newFullPath, status: 'new' }];
          }
        }
      }
    } catch {
      // If status check fails, continue to history check
    }

    // Last resort: check if file content exists in git history (very slow, only if needed)
    // Use --follow to track renames, limit to 1 commit for performance
    try {
      const hasHistory = await git
        .raw(['log', '--all', '--full-history', '--follow', '--oneline', '-1', '--', normalizedGitFilePath])
        .then((output) => output.trim().length > 0)
        .catch(() => false);

      // If file has history but isn't tracked, it might have been moved
      // For now, treat as 'new' at the new location
      // Note: We can't easily find the old path without more complex git operations
      return [{ filepath: filePath, status: hasHistory ? 'modified' : 'new' }];
    } catch {
      // If we can't determine, default to 'new'
      return [{ filepath: filePath, status: 'new' }];
    }
  } catch {
    console.error('error', filePath);
    // If we can't determine status, default to 'new'
    return [{ filepath: filePath, status: 'new' }];
  }
};

/**
 * Check if a file path matches any of the changed files
 * @param filePath - File path to check
 * @param changedFiles - Array of changed file objects
 * @returns True if file has changed
 */
export const isFileChanged = (filePath: string, changedFiles: ChangedFile[]): boolean => {
  if (changedFiles.length === 0) {
    return true; // If no diff filtering, process all files
  }

  return changedFiles.some((file) => file.filepath === filePath);
};

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
