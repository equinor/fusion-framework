import { relative } from 'node:path';
import type { GitMetadata } from './types.js';
import { getGit } from './git-client.js';

/**
 * Generate a GitHub permalink for a file
 * @param gitRemoteUrl - Git remote URL
 * @param filePath - Relative file path from repository root
 * @param slug - Git reference (branch/tag/commit), defaults to 'main'
 * @returns GitHub permalink URL or undefined if not a GitHub repository
 * @internal
 */
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

/**
 * Extract git metadata for a file
 * @param filePath - Absolute file path
 * @returns Git metadata or undefined if not in a git repository
 */
export const extractGitMetadata = async (filePath: string): Promise<GitMetadata | undefined> => {
  const { git, gitRepoPath: gitRepoRoot } = getGit(filePath) ?? {};
  if (!git || !gitRepoRoot) {
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
