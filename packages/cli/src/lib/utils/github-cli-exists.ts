import { execSync } from 'node:child_process';

/**
 * GitHub CLI status information
 */
export interface GitHubCLIStatus {
  /** Whether the GitHub CLI is installed and available */
  available: boolean;
  /** Whether the user is authenticated with GitHub CLI */
  authenticated: boolean;
}

/**
 * Checks if GitHub CLI (`gh`) is installed and whether the user is authenticated.
 *
 * This function performs two checks:
 * 1. Verifies that the `gh` command is available in the system PATH
 * 2. Checks if the user is currently authenticated with GitHub CLI
 *
 * The authentication check is performed by running `gh auth status`, which will
 * return a non-zero exit code if the user is not authenticated or if there are
 * authentication issues.
 *
 * @returns A `GitHubCLIStatus` object containing:
 *   - `available`: `true` if GitHub CLI is installed and accessible, `false` otherwise
 *   - `authenticated`: `true` if the user is authenticated with GitHub CLI, `false` otherwise
 *
 * @example
 * ```typescript
 * const status = githubCliExists();
 * if (status.available && status.authenticated) {
 *   console.log('GitHub CLI is ready to use');
 * } else if (status.available && !status.authenticated) {
 *   console.log('GitHub CLI is installed but not authenticated');
 * } else {
 *   console.log('GitHub CLI is not available');
 * }
 * ```
 *
 * @since 11.2.0
 */
export function githubCliExists(): GitHubCLIStatus {
  try {
    // First check: Verify that the `gh` command is available in the system PATH
    execSync('gh --version', { stdio: 'pipe' });

    // Second check: Verify that the user is authenticated with GitHub CLI
    try {
      execSync('gh auth status', { stdio: 'pipe' });
      // Both checks passed - CLI is available and user is authenticated
      return { available: true, authenticated: true };
    } catch {
      // CLI is available but user is not authenticated
      return { available: true, authenticated: false };
    }
  } catch {
    // CLI is not available or not installed
    return { available: false, authenticated: false };
  }
}
