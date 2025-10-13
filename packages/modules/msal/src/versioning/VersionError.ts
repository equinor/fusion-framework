import type { SemVer } from 'semver';

/**
 * Error class for version-related issues in the MSAL module.
 *
 * This error is thrown when there are version compatibility problems,
 * such as requesting an incompatible major version or providing an invalid version string.
 *
 * @example
 * ```typescript
 * try {
 *   resolveVersion('3.0.0'); // Assuming latest is 2.x
 * } catch (error) {
 *   if (error instanceof VersionError) {
 *     console.error('Version error:', error.message);
 *     console.error('Requested:', error.requestedVersion);
 *     console.error('Latest:', error.latestVersion);
 *     console.error('Type:', error.type);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Create a version error manually
 * const error = VersionError.create(
 *   VersionError.Type.MajorIncompatibility,
 *   '3.0.0',
 *   '2.1.0'
 * );
 * ```
 */
export class VersionError extends Error {
  /** The version that was requested by the user */
  public readonly requestedVersion: string;

  /** The latest available version in the system */
  public readonly latestVersion: string;

  /** The error name for instanceof checks */
  static Name = 'VersionError';

  /**
   * Creates a new VersionError instance.
   *
   * @param message - The error message describing the version issue
   * @param requestedVersion - The version that was requested (will be stored as string)
   * @param latestVersion - The latest available version (will be stored as string)
   * @param options - Additional error options including the error type
   */
  constructor(
    message: string,
    requestedVersion: string | SemVer,
    latestVersion: string | SemVer,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = VersionError.Name;

    // Store versions as strings
    this.requestedVersion = String(requestedVersion);
    this.latestVersion = String(latestVersion);
  }
}
