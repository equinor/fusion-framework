import { execSync } from 'node:child_process';

/**
 * Git availability status information
 */
export interface GitStatus {
  /** Whether git is installed and available */
  available: boolean;
  /** Whether git is properly configured (has user name and email) */
  configured?: boolean;
}

/**
 * Options for checking Git CLI availability
 */
export interface GitCliExistsOptions {
  /** Whether to check Git configuration (user name and email). Defaults to true. */
  checkConfiguration?: boolean;
}

/**
 * Checks if Git is installed and whether it's properly configured.
 *
 * This function performs two checks:
 * 1. Verifies that the `git` command is available in the system PATH
 * 2. Checks if git is properly configured by verifying user name and email are set (optional)
 *
 * The configuration check is only performed if Git is available and `checkConfiguration` is true.
 * If Git is not available, the `configured` property will be undefined.
 *
 * @param options - Optional configuration for the check
 * @returns A `GitStatus` object containing:
 *   - `available`: `true` if git is installed and accessible, `false` otherwise
 *   - `configured`: `true` if git is properly configured with user name and email, `false` if not configured, `undefined` if git is not available or configuration check is disabled
 *
 * @example
 * ```typescript
 * // Check both availability and configuration
 * const status = gitCliExists();
 * if (status.available && status.configured) {
 *   console.log('Git is ready to use');
 * } else if (status.available && status.configured === false) {
 *   console.log('Git is installed but not configured');
 * } else {
 *   console.log('Git is not available');
 * }
 *
 * // Check only availability
 * const status = gitCliExists({ checkConfiguration: false });
 * if (status.available) {
 *   console.log('Git is available');
 * }
 * ```
 *
 * @since 11.2.0
 */
export function gitCliExists(options: GitCliExistsOptions = {}): GitStatus {
  const { checkConfiguration = true } = options;

  try {
    // First check: Verify that the `git` command is available in the system PATH
    execSync('git --version', { stdio: 'pipe' });

    // If configuration check is disabled, only return availability status
    if (!checkConfiguration) {
      return { available: true };
    }

    // Second check: Verify that git is properly configured
    try {
      const userName = String(execSync('git config --get user.name', { stdio: 'pipe' })).trim();
      const userEmail = String(execSync('git config --get user.email', { stdio: 'pipe' })).trim();

      // Git is available and properly configured
      return { available: true, configured: userName.length > 0 && userEmail.length > 0 };
    } catch {
      // Git is available but not configured
      return { available: true, configured: false };
    }
  } catch {
    // Git is not available or not installed
    return { available: false };
  }
}
