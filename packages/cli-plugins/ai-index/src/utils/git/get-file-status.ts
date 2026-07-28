import { join, relative } from 'node:path';
import type { ChangedFile } from './types.js';
import { getGit } from './git-client.js';

/**
 * Determines the git change status of a single file.
 *
 * Checks tracked status, porcelain output, and rename/copy detection to
 * produce one or two {@link ChangedFile} entries (two when a rename is
 * detected — one `'removed'` for the old path and one `'new'` for the
 * current path).
 *
 * @param filePath - Absolute path to the file to inspect.
 * @returns Array with one or two changed-file entries.
 */
export const getFileStatus = async (filePath: string): Promise<ChangedFile[]> => {
  const { git, gitRepoPath } = getGit(filePath) ?? {};
  // Not in a git repository, assume new
  if (!git || !gitRepoPath) {
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

    // File is tracked at this path, it's modified
    if (isTracked) {
      return [{ filepath: filePath, status: 'modified' }];
    }

    // File is not tracked - quickly check if it's explicitly untracked
    // This is much faster than checking full status or history
    try {
      const fileStatusOutput = await git.raw([
        'status',
        '--porcelain',
        '--',
        normalizedGitFilePath,
      ]);
      const trimmed = fileStatusOutput.trim();

      // Only inspect porcelain output when git actually reported something for this path
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
      // Drop blank lines left by the trailing newline in git's output
      const lines = statusOutput.split('\n').filter((line) => line.trim() !== '');

      // Scan every status line for a rename or copy that produced this file
      for (const line of lines) {
        // Check for rename format: "R100\told.ts\tnew.ts"
        const renameMatch = line.match(/^R\d+\s+(.+?)\s+(.+)$/);
        // A rename line resolves this file only if it matches the new path
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
        // A copy line resolves this file only if it matches the new path
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
        .raw([
          'log',
          '--all',
          '--full-history',
          '--follow',
          '--oneline',
          '-1',
          '--',
          normalizedGitFilePath,
        ])
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
    // If we can't determine status, default to 'new'
    return [{ filepath: filePath, status: 'new' }];
  }
};
