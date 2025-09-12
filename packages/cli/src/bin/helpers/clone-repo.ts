import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { tmpdir } from 'node:os';

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
 * Generates a default temporary directory path for cloning repositories.
 *
 * @param repo - Repository name in format "owner/repo" to include in directory name.
 * @returns A unique temporary directory path.
 * @internal
 */
function generateDefaultTempDir(repo: string): string {
  return join(tmpdir(), 'ffc', 'repo', repo, Date.now().toString());
}

/**
 * Options for cloning a repository.
 *
 * This interface defines the shape of the options object accepted by
 * {@link cloneRepo}. It allows for optional logging and custom repository name.
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
 * Clones a repository to a temporary directory.
 *
 * This is the main function that determines the best cloning method based on GitHub CLI availability.
 * It first checks if GitHub CLI is available and authenticated, then chooses the appropriate cloning method.
 *
 * @param options - Options for logger and repository name.
 * @returns The path to the cloned repository directory.
 * @throws If cloning fails or if authentication is required but not available.
 * @public
 */
export function cloneRepo(options: CloneRepoOptions): string {
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
  const { repo, tempDir = generateDefaultTempDir(repo), log } = options;

  // Validate that GitHub CLI is available
  assertGitHubCliExists();

  log?.debug('Using GitHub CLI to clone repository...');

  // Validate repository name format
  assertValidRepoFormat(repo);

  try {
    // Use gh repo clone command
    execSync(`gh repo clone "${repo}" "${tempDir}"`, {
      stdio: 'pipe',
    });

    log?.succeed('Repository cloned successfully using GitHub CLI');
    return tempDir;
  } catch (error) {
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
  const { repo, tempDir = generateDefaultTempDir(repo), log } = options;

  // Validate repository name format
  assertValidRepoFormat(repo);

  // Try HTTPS first, then SSH if that fails
  const cloneUrls = [`https://${GITHUB_DOMAIN}/${repo}.git`, `git@${GITHUB_DOMAIN}:${repo}.git`];

  let lastError: Error | null = null;

  for (const url of cloneUrls) {
    try {
      log?.debug(`Attempting to clone from ${url.includes('git@') ? 'SSH' : 'HTTPS'}...`);

      execSync(`git clone "${url}" "${tempDir}"`, {
        stdio: 'pipe',
      });

      log?.succeed('Repository cloned successfully using git');
      return tempDir;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this is the last attempt, don't continue
      if (url === cloneUrls[cloneUrls.length - 1]) {
        break;
      }
    }
  }

  const errorMessage = lastError?.message || 'Unknown error';
  throw new Error(`Git cloning failed: ${errorMessage}`);
}
