import { SemVer, satisfies } from 'semver';

/**
 * Extends the `SemVer` class to provide additional semantic versioning utilities.
 *
 * @remarks
 * This class adds a `satisfies` method, which checks if the current semantic version instance
 * satisfies the given version range.
 *
 * @example
 * ```typescript
 * const version = new SemanticVersion('1.2.3');
 * if (version.satisfies('^1.0.0')) {
 *   // Version is compatible
 * }
 * ```
 *
 * @extends SemVer
 * @see https://www.npmjs.com/package/semver
 */
export class SemanticVersion extends SemVer {
  /**
   * Determines if the current semantic version satisfies the given version range.
   *
   * @param arg - The version range to test against, as accepted by the `satisfies` function.
   * @returns `true` if the current version satisfies the specified range, otherwise `false`.
   */
  public satisfies(arg: Parameters<typeof satisfies>[1]) {
    return satisfies(this, arg);
  }
}

export default SemanticVersion;
