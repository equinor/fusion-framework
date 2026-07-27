import type { ChangedFile } from './types.js';

/**
 * Checks whether a file path appears in a list of changed files.
 *
 * When the changed-files list is empty (no diff filtering active), every
 * file is considered changed so that all files are processed.
 *
 * @param filePath - Absolute file path to look up.
 * @param changedFiles - Array of {@link ChangedFile} entries to search.
 * @returns `true` if the file has changed or if diff filtering is disabled.
 */
export const isFileChanged = (filePath: string, changedFiles: ChangedFile[]): boolean => {
  // If no diff filtering, process all files
  if (changedFiles.length === 0) {
    return true;
  }

  return changedFiles
    // A file is considered changed when its path matches any entry in the list
    .some((file) => file.filepath === filePath);
};
