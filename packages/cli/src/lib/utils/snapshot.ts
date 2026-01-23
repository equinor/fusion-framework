import { coerce } from 'semver';

/**
 * Generates a snapshot version from a semantic version, coercing pre-release suffixes when present.
 *
 * This function accepts standard semantic versions and versions with pre-release suffixes (e.g.,
 * `1.2.3-beta.1`). It uses {@link coerce} to normalize the input to the base `major.minor.patch`
 * version before appending a timestamp-based snapshot suffix. Snapshot version formats:
 * - With no identifier: {version}-snapshot.{unix_timestamp}
 * - With identifier: {version}-{identifier}.{unix_timestamp}
 *
 * @param version - The semantic version to convert (pre-release suffixes are accepted and stripped)
 * @param identifier - Optional snapshot identifier; if omitted or boolean, defaults to `snapshot`
 * @returns The generated snapshot version string
 * @throws {Error} If the version cannot be coerced into a valid semantic version
 *
 * @example
 * ```typescript
 * // With default identifier
 * generateSnapshotVersion('1.2.3'); // Returns: "1.2.3-snapshot.1737545600"
 *
 * // With custom identifier
 * generateSnapshotVersion('1.2.3', 'pr-123'); // Returns: "1.2.3-pr-123.1737545600"
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
