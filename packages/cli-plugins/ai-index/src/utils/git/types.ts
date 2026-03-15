/**
 * Git metadata extracted from the repository for a single source file.
 *
 * Attached to vector-store documents as part of `metadata.attributes`.
 */
export type GitMetadata = Partial<{
  /** Remote origin URL of the git repository. */
  git_remote_url: string;
  /** Short SHA of the most recent commit that touched the file. */
  git_commit_hash: string;
  /** ISO-8601 date string of the most recent commit that touched the file. */
  git_commit_date: string;
  /** GitHub permalink to the file on the default branch. */
  git_link: string;
}>;

/**
 * Configuration for retrieving changed files via `git diff`.
 */
export interface GitDiffOptions {
  /** When `true`, enable diff-based file filtering. */
  diff: boolean;
  /** Git reference to compare against (e.g. `'HEAD~1'`, `'origin/main'`). Defaults to `'HEAD~1'`. */
  baseRef?: string;
  /** Working directory for git operations. Defaults to `process.cwd()`. */
  cwd?: string;
}

/**
 * Possible change statuses reported by git.
 */
export type FileChangeStatus = 'new' | 'modified' | 'removed';

/**
 * Describes a single file that has changed according to git.
 */
export interface ChangedFile {
  /** Absolute file-system path to the changed file. */
  filepath: string;
  /** How the file was changed: added, modified, or deleted. */
  status: FileChangeStatus;
}
