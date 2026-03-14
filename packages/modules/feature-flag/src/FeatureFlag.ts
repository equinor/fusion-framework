import { immerable } from 'immer';

/**
 * Describes a feature flag entity.
 *
 * A feature flag controls whether a feature is available in the application.
 * Each flag has a unique `key` and may carry an optional typed `value`.
 *
 * @template T - Type of the optional payload value attached to the flag.
 */
export interface IFeatureFlag<T = unknown> {
  /** Unique identifier for the feature flag. */
  readonly key: string;

  /** Human-readable label for the feature flag. */
  readonly title?: string;

  /** Longer description explaining the purpose of the feature flag. */
  readonly description?: string;

  /** When `true`, the flag cannot be toggled by the user or plugins. */
  readonly readonly?: boolean;

  /** Identifies the origin of the flag (e.g. `'localStorage'`, `'api'`). */
  readonly source?: string;

  /** Whether the feature is currently enabled. */
  enabled?: boolean;

  /** Optional typed payload associated with the feature flag. */
  value?: T;
}

/**
 * Concrete implementation of {@link IFeatureFlag}.
 *
 * Wraps flag data in an Immer-compatible class so that the state can be
 * mutated safely inside reducers.
 *
 * @template T - Type of the optional payload value attached to the flag.
 */
export class FeatureFlag<T = unknown> implements IFeatureFlag {
  /** @internal Backing store for the flag properties (excluding `key`). */
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

  /**
   * Creates a {@link FeatureFlag} instance from a plain object or JSON string.
   *
   * @template T - Type of the optional payload.
   * @param objOrString - A plain {@link IFeatureFlag} object or its JSON-serialised form.
   * @returns A new `FeatureFlag` instance.
   *
   * @example
   * ```ts
   * const flag = FeatureFlag.Parse({ key: 'dark-mode', enabled: true });
   * ```
   */
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

  /**
   * @param key - Unique identifier for the feature flag.
   * @param options - Flag properties excluding the `key`.
   */
  constructor(
    public readonly key: string,
    options: Omit<IFeatureFlag<T>, 'key'>,
  ) {
    this._options = options;
  }

  /**
   * Serialises the flag to a plain {@link IFeatureFlag} object suitable for
   * JSON storage.
   */
  public toJSON(): IFeatureFlag {
    const { enabled, value, source } = this._options;
    return { key: this.key, enabled, value, source };
  }
}
