import type { SemVer } from 'semver';
import { VersionMessageType } from './static';

/**
 * Creates a human-readable version message based on the version message type.
 *
 * This function generates descriptive error messages for different version compatibility
 * scenarios, helping developers understand version-related issues.
 *
 * @param type - The type of version message to create
 * @param requestedVersion - The version that was requested by the user
 * @param latestVersion - The latest available version in the system
 * @returns A formatted, human-readable version message string
 *
 * @example
 * ```typescript
 * const message = createVersionMessage(
 *   VersionMessageType.MajorIncompatibility,
 *   '3.0.0',
 *   '2.1.0'
 * );
 * // Returns: "Requested major version 3.0.0 is greater than the latest major version 2.1.0"
 * ```
 *
 * @example
 * ```typescript
 * const message = createVersionMessage(
 *   VersionMessageType.MinorMismatch,
 *   '2.1.0',
 *   '2.2.0'
 * );
 * // Returns: "Minor version mismatch, requested 2.1.0, latest 2.2.0"
 * ```
 */
export const createVersionMessage = (
  type: VersionMessageType,
  requestedVersion: string | SemVer,
  latestVersion: string | SemVer,
): string => {
  // Convert versions to strings for consistent formatting
  const requestedVersionString = String(requestedVersion);
  const latestVersionString = String(latestVersion);
  switch (type) {
    case VersionMessageType.MajorIncompatibility:
      return `Requested major version ${requestedVersionString} is greater than the latest major version ${latestVersionString}`;
    case VersionMessageType.InvalidVersion:
      return `Invalid version ${requestedVersionString}`;
    case VersionMessageType.InvalidLatestVersion:
      return `Failed to parse latest version "${latestVersionString}" - this indicates the version.ts file was not generated correctly. Check for import errors in the build process.`;
    case VersionMessageType.MinorMismatch:
      return `Minor version mismatch, requested ${requestedVersionString}, latest ${latestVersionString}`;
    case VersionMessageType.PatchDifference:
      return `Patch version difference, requested ${requestedVersionString}, latest ${latestVersionString}`;
    case VersionMessageType.IncompatibleVersion:
      return `Incompatible version, requested ${requestedVersionString}, latest ${latestVersionString}`;
    default:
      return createVersionMessage(
        VersionMessageType.IncompatibleVersion,
        requestedVersion,
        latestVersion,
      );
  }
};
