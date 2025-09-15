import { VersionMessageType } from './static';
import { createVersionMessage } from './create-version-message';
import { SemVer } from 'semver';

/**
 * Creates a VersionError instance with a formatted message.
 *
 * This is a helper function that creates a VersionError with a human-readable
 * message based on the error type and version information.
 *
 * @param type - The type of version error
 * @param requestedVersion - The version that was requested
 * @param latestVersion - The latest available version
 * @param options - Additional error options including the error type
 * @returns A new VersionError instance with formatted message
 */
const createVersionError = (
  type: VersionMessageType,
  requestedVersion: string | SemVer,
  latestVersion: string | SemVer,
  options?: ErrorOptions & { type?: VersionMessageType },
): VersionError => {
  return new VersionError(
    createVersionMessage(type, requestedVersion, latestVersion),
    requestedVersion,
    latestVersion,
    { ...options, type },
  );
};

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
  public readonly requestedVersion: SemVer;

  /** The latest available version in the system */
  public readonly latestVersion: SemVer;

  /** The specific type of version error that occurred */
  public readonly type?: VersionMessageType;

  /** The error name for instanceof checks */
  static Name = 'VersionError';

  /** Reference to the VersionMessageType enum for convenience */
  static Type = VersionMessageType;

  /** Factory method for creating VersionError instances with formatted messages */
  static create: typeof createVersionError = createVersionError;

  /**
   * Creates a new VersionError instance.
   *
   * @param message - The error message describing the version issue
   * @param requestedVersion - The version that was requested (will be converted to SemVer)
   * @param latestVersion - The latest available version (will be converted to SemVer)
   * @param options - Additional error options including the error type
   */
  constructor(
    message: string,
    requestedVersion: string | SemVer,
    latestVersion: string | SemVer,
    options?: ErrorOptions & { type?: VersionMessageType },
  ) {
    super(message, options);
    this.name = VersionError.Name;
    this.requestedVersion = new SemVer(requestedVersion);
    this.latestVersion = new SemVer(latestVersion);
    this.type = options?.type;
  }
}
