// Re-export all types
export type {
  GitMetadata,
  GitDiffOptions,
  FileChangeStatus,
  ChangedFile,
} from './types.js';

// Re-export git client utilities
export { resolveProjectRoot, getGit } from './git-client.js';

// Re-export metadata functions
export { extractGitMetadata } from './metadata.js';

// Re-export file change functions
export { getChangedFiles } from './get-changed-files.js';
export { getFileStatus } from './get-file-status.js';
export { isFileChanged } from './is-file-changed.js';

// Re-export status functions
export { getGitStatus } from './status.js';
