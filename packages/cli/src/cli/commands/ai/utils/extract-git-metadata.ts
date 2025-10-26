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
  const gitRepoPath = findUpSync('.git', { cwd: dirname(filePath) });
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
 * Get list of changed files using git diff
 * @param options - Git diff configuration options
 * @returns Array of changed file paths
 */
export const getChangedFiles = async (options: GitDiffOptions): Promise<string[]> => {
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
    // Get changes since baseRef
    try {
      const diffResult = await git.diff([`${baseRef}`, '--name-only']);
      const changedFiles = diffResult.split('\n').filter(file => file.trim() !== '');
      return changedFiles.map(file => `${projectRoot}/${file}`);
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
 * Check if a file path matches any of the changed files
 * @param filePath - File path to check
 * @param changedFiles - Array of changed file paths
 * @returns True if file has changed
 */
export const isFileChanged = (filePath: string, changedFiles: string[]): boolean => {
  if (changedFiles.length === 0) {
    return true; // If no diff filtering, process all files
  }
  
  return changedFiles.includes(filePath);
};

/**
 * Get git status information for debugging
 * @param cwd - Working directory
 * @returns Git status information
 */
export const getGitStatus = async (cwd: string = process.cwd()): Promise<{
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
    const unstagedFiles = statusResult.modified.length + statusResult.deleted.length + statusResult.not_added.length;
    
    return {
      branch: branch.trim(),
      commit: commit.trim(),
      hasChanges: stagedFiles > 0 || unstagedFiles > 0,
      stagedFiles,
      unstagedFiles
    };
  } catch (error) {
    throw new Error(`Failed to get git status: ${error instanceof Error ? error.message : String(error)}`);
  }
};
