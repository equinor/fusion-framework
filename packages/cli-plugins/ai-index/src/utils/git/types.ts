/**
 * Git metadata extracted from repository
 */
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
