import { immerable } from 'immer';
/**
 *  Feature flag entity
 */
export interface IFeatureFlag<T = unknown> {
    /** unique name of the feature */
    readonly key: string;

    /** indicate that the flag cannot be toggled  */
    readonly readonly?: boolean;

    /** hint of the creator  */
    readonly source?: string;

    /** indicates if the feature is enabled */
    enabled?: boolean;

    /** given value for the */
    value?: T;
}

export class FeatureFlag<T = unknown> implements IFeatureFlag {
    public enabled?: boolean;
    public value?: T;

    [immerable] = true;

    static Parse<T>(objOrString: IFeatureFlag<T>): FeatureFlag<T> {
                const obj = typeof objOrString === 'string' ? JSON.parse(objOrString) : objOrString;
        const attrs: Array<keyof IFeatureFlag> = ['enabled', 'value', 'readonly', 'source'];
        return attrs.reduce(
            (acc, attr) => Object.assign(acc, { [attr]: obj[attr] }),
            new FeatureFlag<T>(obj.key, obj.readonly, obj.source),
        );
    }

    constructor(
        public readonly key: string,
        public readonly readonly?: boolean,
        public readonly source?: string,
    ) {}

    public toJSON(): IFeatureFlag {
                const { key, enabled, value, readonly, source } = this;
        return { key, enabled, value, readonly, source };
    }
}
