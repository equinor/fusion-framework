import { SemVer, satisfies } from 'semver';

/**
 * Extension of {@link SemVer} to expose `satisfies`
 * @see {@link [SemVer](https://www.npmjs.com/package/semver)}
 */
export class SemanticVersion extends SemVer {
    public satisfies(arg: Parameters<typeof satisfies>[1]) {
        return satisfies(this, arg);
    }
}

export default SemanticVersion;
