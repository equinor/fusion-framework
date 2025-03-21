import { immerable } from 'immer';
/**
 *  Feature flag entity
 */
export interface IFeatureFlag<T = unknown> {
  /** unique name of the feature */
  readonly key: string;

  readonly title?: string;

  readonly description?: string;

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
  _options: Omit<IFeatureFlag<T>, 'key'>;

  get enabled(): boolean {
    return !!this._options.enabled;
  }

  set enabled(value: boolean) {
    this._options.enabled = value;
  }

  get value(): T | undefined {
    return this._options.value;
  }

  get title(): string | undefined {
    return this._options.title;
  }

  get description(): string | undefined {
    return this._options.description;
  }

  get source(): string | undefined {
    return this._options.source;
  }

  get readonly(): boolean {
    return !!this._options.readonly;
  }

  [immerable] = true;

  static Parse<T>(objOrString: IFeatureFlag<T>): FeatureFlag<T> {
    const obj = typeof objOrString === 'string' ? JSON.parse(objOrString) : objOrString;
    const attrs: Array<keyof IFeatureFlag> = [
      'enabled',
      'value',
      'source',
      'title',
      'description',
      'readonly',
    ];
    const options = attrs.reduce((acc, attr) => Object.assign(acc, { [attr]: obj[attr] }), {});
    return new FeatureFlag<T>(obj.key, options);
  }

  constructor(
    public readonly key: string,
    options: Omit<IFeatureFlag<T>, 'key'>,
  ) {
    this._options = options;
  }

  public toJSON(): IFeatureFlag {
    const { enabled, value, source } = this._options;
    return { key: this.key, enabled, value, source };
  }
}
