/**
 * File change status in git
 */
export type FileStatus = 'new' | 'modified' | 'removed';

/**
 * Source file information for processing
 */
export type SourceFile = {
  /** Absolute file path */
  path: string;
  /** Project root directory (git repository root) */
  projectRoot?: string;
  /** Relative path from project root */
  relativePath?: string;
  /** Git change status */
  status: FileStatus;
};
