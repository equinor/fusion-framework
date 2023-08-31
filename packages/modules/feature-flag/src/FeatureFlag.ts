import {
    SemVer,
    type Range as SemVerRange,
    parse as parseSemVer,
    satisfies as satisfiesSemVer,
} from 'semver';

export type FeatureFlagObj<T = unknown> = {
    name: string;
    version?: string | SemVer;
    enabled?: boolean;
    value?: T;
};

export class FeatureFlag<T = unknown> {
    public version?: string | SemVer;
    public enabled?: boolean;
    public value?: T;

    static Identify(flag: FeatureFlagObj) {
        const { name, version } = flag;
        if (name.includes('@') || version === undefined) {
            return name;
        }
        return [name, name].join('@');
    }

    static Parse<T>(obj: FeatureFlagObj<T>): FeatureFlag<T> {
        if (obj instanceof FeatureFlag) {
            return obj;
        }
        const attr: Array<keyof FeatureFlagObj> = ['version', 'enabled', 'value', 'version'];
        return attr.reduce(
            (acc, key) => Object.assign(acc, { [key]: obj[key] }),
            new FeatureFlag<T>(obj.name),
        );
    }

    get semver() {
        return parseSemVer(this.version);
    }

    get key() {
        return FeatureFlag.Identify(this);
    }

    constructor(public readonly name: string) {}

    satisfies(range: string | SemVerRange) {
        return this.version && satisfiesSemVer(this.version, range);
    }

    toJSON(): FeatureFlagObj {
        const { name, version, enabled } = this;
        return { name, version, enabled };
    }
}
