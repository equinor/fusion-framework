import semver from 'semver';

/**
 * Extension of {@link SemVer} to expose `satisfies`
 * @see {@link [SemVer](https://www.npmjs.com/package/semver)}
 */
export class SemanticVersion extends semver.SemVer {
  public satisfies(arg: Parameters<typeof semver.satisfies>[1]) {
    return semver.satisfies(this, arg);
  }
}

export default SemanticVersion;
