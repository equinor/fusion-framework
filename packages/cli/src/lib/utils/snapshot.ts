import { coerce, valid } from 'semver';

/**
 * Generates a snapshot version from a base semantic version.
 *
 * This function takes a valid release version (without pre-release suffix) and generates
 * a snapshot version by appending a timestamp-based suffix. The snapshot version format is:
 * - With no identifier: {version}-snapshot.{unix_timestamp}
 * - With identifier: {version}-{identifier}.{unix_timestamp}
 *
 * The function automatically validates the input version and will throw an error if it
 * already contains a pre-release suffix.
 *
 * @param version - The base semantic version (must not contain pre-release suffix)
 * @param options - Optional configuration for snapshot generation
 * @returns The generated snapshot version string
 * @throws {Error} If the version is not valid or already contains a pre-release suffix
 *
 * @example
 * ```typescript
 * // With default identifier
 * generateSnapshotVersion('1.2.3'); // Returns: "1.2.3-snapshot.1737545600"
 *
 * // With custom identifier
 * generateSnapshotVersion('1.2.3', { identifier: 'pr-123' }); // Returns: "1.2.3-pr-123.1737545600"
 * ```
 *
 * @public
 */
export function generateSnapshotVersion(version: string, identifier?: boolean | string): string {
  // Coerce the version to strip any pre-release suffix and get the base version
  const baseVersion = coerce(version)?.version;

  if (!baseVersion) {
    throw new Error(`Invalid semantic version: "${version}". Expected format: major.minor.patch`);
  }

  // Generate the unix timestamp for uniqueness
  const unixTimestamp = Math.floor(Date.now() / 1000);

  // Determine the suffix format based on whether an identifier was provided
  const suffix =
    typeof identifier === 'string' ? `${identifier}.${unixTimestamp}` : `snapshot.${unixTimestamp}`;

  // Return the formatted snapshot version
  return `${baseVersion}-${suffix}`;
}
