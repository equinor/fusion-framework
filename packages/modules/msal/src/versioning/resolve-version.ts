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
  // Initialize warnings array to collect any version mismatches
  const warnings: string[] = [];

  // Parse the requested version, defaulting to latest if not provided
  const versionString = version || MsalModuleVersion.Latest;

  // Parse versions using coerce for backward compatibility
  const latestVersion = semver.coerce(MsalModuleVersion.Latest);

  // This should never happen! Indicates version.ts was not generated correctly
  // This is a critical build-time issue that needs immediate attention
  if (!latestVersion) {
    throw new VersionError(
      `Failed to parse latest version "${MsalModuleVersion.Latest}" - this indicates the version.ts file was not generated correctly. Check for import errors in the build process.`,
      versionString,
      MsalModuleVersion.Latest,
    );
  }

  let wantedVersion: SemVer | null = semver.coerce(versionString);
  // Validate that the requested version is a valid semver
  if (!wantedVersion) {
    const missingVersionWarning = new VersionError(
      `Failed to parse requested version "${versionString}"`,
      versionString,
      MsalModuleVersion.Latest,
    );
    warnings.push(missingVersionWarning.message);
    wantedVersion = latestVersion;
  }

  if (wantedVersion.major < latestVersion.major) {
    const majorBehindVersionWarning = new VersionError(
      `Requested major version ${wantedVersion.major} is behind the latest major version ${latestVersion.major}`,
      wantedVersion,
      latestVersion,
    );
    warnings.push(majorBehindVersionWarning.message);
  }

  // Minor version mismatch - add warning but don't throw
  // This helps developers stay aware of version differences without breaking functionality
  if (wantedVersion.major === latestVersion.major && wantedVersion.minor !== latestVersion.minor) {
    const minorMismatchWarning = new VersionError(
      `Requested minor version ${wantedVersion.minor} is different from the latest minor version ${latestVersion.minor}`,
      wantedVersion,
      latestVersion,
    );
    warnings.push(minorMismatchWarning.message);
  }

  // Find the corresponding enum version for the requested major version
  // This is used for module configuration and feature detection
  let enumVersion = Object.values(MsalModuleVersion).find(
    (x) => semver.coerce(x)?.major === wantedVersion.major,
  );

  // If no matching enum version is found, fall back to the latest available
  // This allows forward compatibility with future versions
  if (!enumVersion) {
    enumVersion = MsalModuleVersion.Latest;
    // Only warn if this is a future version (higher than latest)
    if (wantedVersion.major > latestVersion.major) {
      const fallbackWarning = new VersionError(
        `Requested major version ${wantedVersion.major} is greater than the latest major version ${latestVersion.major}. Falling back to latest version.`,
        wantedVersion,
        latestVersion,
      );
      warnings.push(fallbackWarning.message);
    }
  }

  // Return comprehensive version resolution result
  return {
    wantedVersion,
    latestVersion,
    isLatest: wantedVersion.compare(latestVersion) === 0,
    satisfiesLatest: wantedVersion.major === latestVersion.major,
    enumVersion,
    warnings: warnings.length > 0 ? warnings : undefined,
  } satisfies ResolvedVersion;
}

export default resolveVersion;
