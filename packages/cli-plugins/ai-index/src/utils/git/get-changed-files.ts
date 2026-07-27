import type { ChangedFile, FileChangeStatus, GitDiffOptions } from './types.js';
import { resolveProjectRoot, getGit } from './git-client.js';

/**
 * Returns a list of files changed between `baseRef` and HEAD.
 *
 * Parses the output of `git diff --name-status` to classify each file as
 * `'new'`, `'modified'`, or `'removed'`. Renames are expanded into a
 * `'removed'` entry for the old path and a `'new'` entry for the new path.
 *
 * @param options - Configuration controlling the diff reference and working directory.
 * @returns Array of changed files with their status.
 * @throws {Error} If the working directory is not inside a git repository.
 */
export const getChangedFiles = async (options: GitDiffOptions): Promise<ChangedFile[]> => {
  const { diff, baseRef = 'HEAD~1', cwd = process.cwd() } = options;

  // Skip git entirely when diff mode wasn't requested
  if (!diff) {
    return [];
  }

  const projectRoot = resolveProjectRoot(cwd);
  // Diff mode requires a git repository to resolve the project root against
  if (!projectRoot) {
    throw new Error('Not in a git repository. Cannot use --diff option.');
  }

  const { git } = getGit(cwd) ?? {};
  // Cannot proceed without a working git client
  if (!git) {
    throw new Error('Failed to initialize git client');
  }

  try {
    // Get changes since baseRef with status (A=added, M=modified, D=deleted)
    try {
      const diffResult = await git.diff([`${baseRef}`, '--name-status']);
      const lines = diffResult
        .split('\n')
        // Drop blank lines left by the trailing newline in git's output
        .filter((line) => line.trim() !== '');

      const changedFiles: ChangedFile[] = [];

      // Classify each changed line by its git status code
      for (const line of lines) {
        // Match status and file path
        // Format: "A\tfile.ts" or "M\tfile.ts" or "D\tfile.ts"
        // Also handle renames: "R100\told.ts\tnew.ts"
        const renameMatch = line.match(/^R\d*\s+(.+?)\s+(.+)$/);
        // Expand a detected rename into a removed old-path entry and a new-path entry
        if (renameMatch) {
          const [, oldFile, newFile] = renameMatch;
          // Add both the removed old file and the new file
          changedFiles.push({ filepath: `${projectRoot}/${oldFile}`, status: 'removed' });
          changedFiles.push({ filepath: `${projectRoot}/${newFile}`, status: 'new' });
          // Rename already handled above; skip the add/modify/delete matching below
          continue;
        }

        const match = line.match(/^([AMD])\s+(.+)$/);
        // Only lines matching the single-letter add/modify/delete status format are actionable
        if (match) {
          const [, gitStatus, file] = match;
          const fullPath = `${projectRoot}/${file}`;

          let status: FileChangeStatus;
          // Map git's single-letter status codes to our ChangedFile status values
          if (gitStatus === 'A') {
            status = 'new';
          } else if (gitStatus === 'M') {
            status = 'modified';
          } else if (gitStatus === 'D') {
            status = 'removed';
          } else {
            // Skip unknown statuses (C=copied, etc.)
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
