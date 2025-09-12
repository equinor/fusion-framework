import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { existsSync, rmSync } from 'node:fs';

import { isGitDir } from '../../lib/utils/is-git-dir.js';
import { githubCliExists } from '../../lib/utils/github-cli-exists.js';

import type { ConsoleLogger } from '../utils/ConsoleLogger.js';
import { assertGitHubCliExists, assertValidRepoFormat } from '../../lib/utils/assert.js';

/**
 * GitHub domain constant for repository cloning.
 *
 * Used to construct repository URLs for both HTTPS and SSH cloning methods.
 */
const GITHUB_DOMAIN = 'github.com' as const;

/**
 * Generates a temporary directory path for cloning repositories.
 *
 * @param repo - Repository name in format "owner/repo" to include in directory name.
 * @returns A unique temporary directory path.
 * @internal
 */
function generateTmpDir(repo: string): string {
  return join(tmpdir(), 'ffc', 'repo', repo);
}

/**
 * Checks if a git repository has the correct remote origin.
 *
 * @param dir - Directory path to check.
 * @param expectedRepo - Expected repository in format "owner/repo".
 * @returns True if the repository has the correct remote origin, false otherwise.
 * @internal
 */
function hasCorrectRemoteOrigin(dir: string, expectedRepo: string): boolean {
  try {
    const remoteUrl = String(
      execSync('git remote get-url origin', {
        cwd: dir,
        stdio: 'pipe',
      }),
    ).trim();

    // Check if the remote URL contains the expected repository
    // Handle both HTTPS and SSH formats:
    // - HTTPS: https://github.com/owner/repo.git
    // - SSH: git@github.com:owner/repo.git
    return remoteUrl.includes(expectedRepo) || remoteUrl.includes(expectedRepo.replace('/', ':'));
  } catch {
    return false;
  }
}

/**
 * Gets the default branch name of a git repository.
 *
 * @param dir - Directory path to check.
 * @returns The default branch name, falling back to 'main' if detection fails.
 * @internal
 */
function getDefaultBranch(dir: string): string {
  try {
    return String(
      execSync('git symbolic-ref refs/remotes/origin/HEAD', {
        cwd: dir,
        stdio: 'pipe',
      }),
    )
      .trim()
      .replace('refs/remotes/origin/', '');
  } catch {
    // Fallback to main if we can't determine the default branch
    return 'main';
  }
}

/**
 * Options for checking out a repository locally.
 *
 * This interface defines the shape of the options object accepted by
 * {@link checkoutRepo}. It allows for optional logging and custom repository name.
 *
 * @public
 */
export interface CloneRepoOptions {
  /**
   * Logger instance for outputting progress and debug information (optional).
   */
  log?: ConsoleLogger | null;
  /**
   * Repository name in the format "owner/repo" (e.g., "equinor/fusion-app-template").
   */
  repo: string;
  /**
   * Temporary directory to clone into (optional, will be generated if not provided).
   */
  tempDir?: string;
}

/**
 * Checks out a repository locally, updating or cloning as needed.
 *
 * This function first checks if the repository already exists and is valid.
 * If it exists and has the correct remote origin, it will update to the latest changes.
 * Otherwise, it will clone the repository using the best available method.
 *
 * This optimization significantly improves performance for repeated operations
 * by avoiding unnecessary re-cloning of the same repository.
 *
 * @param options - Options for logger and repository name.
 * @returns The path to the repository directory.
 * @throws If repository operations fail or if authentication is required but not available.
 * @public
 */
export function checkoutRepo(options: CloneRepoOptions): string {
  const { repo, tempDir = generateTmpDir(repo), log } = options;

  // Validate repository name format
  assertValidRepoFormat(repo);

  // Check if repository already exists and is valid
  const isRepo = isGitDir(tempDir);
  const hasCorrectOrigin = isRepo ? hasCorrectRemoteOrigin(tempDir, repo) : false;
  log?.debug('Repository check:', { repo, tempDir, isRepo, hasCorrectOrigin });

  if (isRepo && hasCorrectOrigin) {
    log?.start('Repository already exists, updating to latest changes...');

    try {
      // Fetch the latest changes first
      execSync('git fetch origin', {
        cwd: tempDir,
        stdio: log ? 'inherit' : 'pipe',
      });

      // Get the default branch name
      const defaultBranch = getDefaultBranch(tempDir);

      // Reset to the latest commit on the default branch (discards any local changes)
      // This ensures we have a clean state matching the remote exactly
      execSync(`git reset --hard origin/${defaultBranch}`, {
        cwd: tempDir,
        stdio: log ? 'inherit' : 'pipe',
      });

      log?.succeed('Repository updated successfully');
      return tempDir;
    } catch (error) {
      log?.fail('Failed to update repository, will re-clone repository');
      log?.debug(error);
      // Fall through to cloning logic
    }
  }

  // Check GitHub CLI availability first
  if (githubCliExists().available) {
    // Use GitHub CLI for authenticated cloning
    return cloneRepoFromGitHub(options);
  }

  // Fall back to git commands
  return cloneRepoFromGit(options);
}

/**
 * Clones a repository using GitHub CLI commands.
 *
 * This function uses the `gh` command to clone repositories, which handles authentication
 * automatically if the user is logged in to GitHub CLI.
 *
 * @param options - Options for repository, temporary directory, and logging.
 * @returns The path to the cloned repository directory.
 * @throws If GitHub CLI cloning fails.
 * @public
 */
export function cloneRepoFromGitHub(options: CloneRepoOptions): string {
  const { repo, tempDir = generateTmpDir(repo), log } = options;

  log?.start('Using GitHub CLI to clone repository...');

  // Validate that GitHub CLI is available
  assertGitHubCliExists();

  // Validate repository name format
  assertValidRepoFormat(repo);

  try {
    // Remove existing directory if it exists (since gh doesn't support --force)
    if (existsSync(tempDir)) {
      log?.debug('Removing existing directory...');
      rmSync(tempDir, { recursive: true, force: true });
    } else {
      log?.debug('Directory does not exist, proceeding with clone...');
    }

    // Use gh repo clone command
    const cloneCommand = `gh repo clone "${repo}" "${tempDir}"`;
    log?.debug(`Executing: ${cloneCommand}`);

    execSync(cloneCommand, {
      stdio: log ? 'inherit' : 'pipe',
    });

    log?.succeed('Repository cloned successfully using GitHub CLI');
    return tempDir;
  } catch (error) {
    log?.fail('GitHub CLI cloning failed');
    log?.debug(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`GitHub CLI cloning failed: ${errorMessage}`);
  }
}

/**
 * Clones a repository using git commands (HTTPS and SSH fallback).
 *
 * This function tries HTTPS first, then SSH if that fails. It's used when GitHub CLI
 * is not available or not authenticated.
 *
 * @param options - Options for repository, temporary directory, and logging.
 * @returns The path to the cloned repository directory.
 * @throws If git cloning fails.
 * @public
 */
export function cloneRepoFromGit(options: CloneRepoOptions): string {
  const { repo, tempDir = generateTmpDir(repo), log } = options;

  log?.start('Using git commands to clone repository...');

  // Validate repository name format
  assertValidRepoFormat(repo);

  // Remove existing directory if it exists (since git clone doesn't support --force)
  if (existsSync(tempDir)) {
    log?.debug('Removing existing directory...');
    rmSync(tempDir, { recursive: true, force: true });
  } else {
    log?.debug('Directory does not exist, proceeding with clone...');
  }

  // Try HTTPS first, then SSH if that fails
  const cloneUrls = [`https://${GITHUB_DOMAIN}/${repo}.git`, `git@${GITHUB_DOMAIN}:${repo}.git`];

  let lastError: Error | null = null;

  for (const url of cloneUrls) {
    try {
      log?.info(`Attempting to clone from ${url.includes('git@') ? 'SSH' : 'HTTPS'}...`);
      log?.debug(`Cloning from: ${url}`);

      execSync(`git clone "${url}" "${tempDir}"`, {
        stdio: log ? 'inherit' : 'pipe',
      });

      log?.succeed('Repository cloned successfully using git');
      return tempDir;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this is the last attempt, don't continue
      if (url === cloneUrls[cloneUrls.length - 1]) {
        log?.fail('Git cloning failed');
        log?.debug(lastError);
      }
    }
  }

  const errorMessage = lastError?.message || 'Unknown error';
  throw new Error(`Git cloning failed: ${errorMessage}`, { cause: lastError });
}

export default checkoutRepo;
