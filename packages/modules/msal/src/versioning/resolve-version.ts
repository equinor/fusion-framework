import semver, { type SemVer } from 'semver';

import { MsalModuleVersion } from '../static';

import { VersionError } from './VersionError';
import type { ResolvedVersion } from './types';

/**
 * Resolves and validates a version string against the latest available MSAL version.
 *
 * This function performs comprehensive version checking including:
 * - Parsing and validating the requested version
 * - Checking major version compatibility (throws on incompatibility)
 * - Warning on minor version mismatches (logs warning but continues)
 * - Ignoring patch version differences for maximum compatibility
 *
 * @param version - The version string or SemVer object to resolve. If not provided, defaults to latest.
 * @returns A ResolvedVersion object containing parsed versions and compatibility information
 *
 * @throws {VersionError} When the requested version is invalid or incompatible
 *
 * @example
 * ```typescript
 * // Resolve a specific version
 * const result = resolveVersion('2.1.0');
 * console.log(result.satisfiesLatest); // true if major version matches
 *
 * // Resolve with SemVer object
 * const result2 = resolveVersion(new SemVer('2.0.0'));
 *
 * // Default to latest version
 * const result3 = resolveVersion();
 * ```
 *
 * @example
 * ```typescript
 * // Error handling
 * try {
 *   const result = resolveVersion('3.0.0'); // Assuming latest is 2.x
 * } catch (error) {
 *   if (error instanceof VersionError) {
 *     console.error('Version error:', error.message);
 *   }
 * }
 * ```
 */
export function resolveVersion(version?: string | SemVer): ResolvedVersion {
  // Parse the requested version, defaulting to latest if not provided
  const wantedVersion = semver.coerce(version || MsalModuleVersion.Latest);
  const latestVersion = semver.coerce(MsalModuleVersion.Latest);

  // Validate that the requested version is a valid semver
  if (!wantedVersion) {
    throw VersionError.create(
      VersionError.Type.InvalidVersion,
      version || '<unknown>',
      MsalModuleVersion.Latest,
    );
  }

  // This should never happen! Indicates version.ts was not generated correctly
  // This is a critical build-time issue that needs immediate attention
  if (!latestVersion) {
    throw VersionError.create(
      VersionError.Type.InvalidLatestVersion,
      version || '<unknown>',
      MsalModuleVersion.Latest,
    );
  }

  // Major version incompatibility check - this is a hard error
  // Users cannot request a major version that doesn't exist yet
  if (wantedVersion.major > latestVersion.major) {
    throw VersionError.create(
      VersionError.Type.MajorIncompatibility,
      String(wantedVersion),
      String(latestVersion),
    );
  }

  // Minor version mismatch - log warning but allow execution
  // This helps developers stay aware of version differences without breaking functionality
  if (wantedVersion.major === latestVersion.major && wantedVersion.minor !== latestVersion.minor) {
    const warning = VersionError.create(
      VersionError.Type.MinorMismatch,
      String(wantedVersion),
      String(latestVersion),
    );
    console.warn(warning);
  }

  // Find the corresponding enum version for the requested major version
  // This is used for module configuration and feature detection
  const enumVersion = Object.values(MsalModuleVersion).find(
    (x) => semver.coerce(x)?.major === wantedVersion.major,
  ) as MsalModuleVersion;

  // Return comprehensive version resolution result
  return {
    wantedVersion,
    latestVersion,
    isLatest: wantedVersion.compare(latestVersion) === 0,
    satisfiesLatest: wantedVersion.major === latestVersion.major,
    enumVersion,
  } satisfies ResolvedVersion;
}

export default resolveVersion;
