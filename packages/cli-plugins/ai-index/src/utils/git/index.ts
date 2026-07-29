// Re-export all types
export type {
  GitMetadata,
  GitDiffOptions,
  FileChangeStatus,
  ChangedFile,
} from './types.js';

// Re-export git client utilities
export { resolveProjectRoot } from './resolve-project-root.js';
export { getGit } from './get-git.js';

// Re-export metadata functions
export { extractGitMetadata } from './extract-git-metadata.js';

// Re-export file change functions
export { getChangedFiles } from './get-changed-files.js';
export { getFileStatus } from './get-file-status.js';
export { isFileChanged } from './is-file-changed.js';

// Re-export status functions
export { getGitStatus } from './get-git-status.js';
