/**
 * Git-tracked change status of a source file.
 *
 * - `'new'` — file is untracked or newly added.
 * - `'modified'` — file is tracked and has been changed.
 * - `'removed'` — file has been deleted.
 */
export type FileStatus = 'new' | 'modified' | 'removed';

/**
 * Represents a source file to be indexed, enriched with path and git status info.
 */
export type SourceFile = {
  /** Absolute file system path. */
  path: string;
  /** Absolute path to the git repository root. */
  projectRoot?: string;
  /** Path relative to {@link projectRoot}. */
  relativePath?: string;
  /** Current git change status. */
  status: FileStatus;
};
