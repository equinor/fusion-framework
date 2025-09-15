import type { SemVer } from 'semver';
import type { MsalModuleVersion } from '../static';

/**
 * Result of version resolution containing parsed versions and compatibility information.
 *
 * This type represents the outcome of resolving a version string against the latest
 * available MSAL version, providing detailed compatibility information for consumers.
 *
 * @example
 * ```typescript
 * const result: ResolvedVersion = {
 *   wantedVersion: new SemVer('2.1.0'),
 *   latestVersion: new SemVer('2.2.0'),
 *   isLatest: false,
 *   satisfiesLatest: true,
 *   enumVersion: MsalModuleVersion.V2
 * };
 * ```
 */
export type ResolvedVersion = {
  /**
   * The version that was requested and successfully parsed.
   * This is the SemVer object representing the user's requested version.
   */
  wantedVersion: SemVer;

  /**
   * The latest available version in the system.
   * This represents the most recent MSAL version that the module supports.
   */
  latestVersion: SemVer;

  /**
   * Whether the wanted version is exactly the latest version.
   * True when wantedVersion.compare(latestVersion) === 0
   */
  isLatest: boolean;

  /**
   * Whether the wanted version satisfies the latest major version.
   * True when major versions match, regardless of minor/patch differences.
   * This is the primary compatibility check for MSAL versions.
   */
  satisfiesLatest: boolean;

  /**
   * The corresponding enum version for the wanted version.
   * Maps the major version number to the appropriate MsalModuleVersion enum value.
   * Used for module configuration and feature detection.
   */
  enumVersion: MsalModuleVersion;
};
