import { from, lastValueFrom, of, type Observable, type ObservableInput } from 'rxjs';
import { mergeMap, reduce } from 'rxjs/operators';
import { Modules, ModuleType } from './types';
import { type DotPath, type DotPathType } from './utils/dot-path';

/** helper function for extracting multilevel attribute keys */
const assignConfigValue = <T>(
    obj: Record<string, unknown>,
    prop: string | string[],
    value: unknown,
): T => {
    const props = typeof prop === 'string' ? prop.split('.') : prop;
    const attr = props.shift();
    if (attr) {
        obj[attr] ??= {};
        props.length
            ? assignConfigValue(obj[attr] as Record<string, unknown>, props, value)
            : Object.assign(obj, { [attr]: value });
    }
    return obj as T;
};

/**
 * callback arguments for config builder callback function
 * @template TRef parent instance
 */
export type ConfigBuilderCallbackArgs<TConfig = unknown, TRef = unknown> = {
    config: TConfig;

    /** reference, parent modules */
    ref?: TRef;

    /**
     * request a sibling module
     * @template TKey name of module
     * @argument module name of module
     */
    requireInstance<TKey extends string = Extract<keyof Modules, string>>(
        module: TKey,
    ): Promise<ModuleType<Modules[TKey]>>;

    /**
     * request a sibling module
     * @template T module type
     * @argument module name of module
     */
    requireInstance<T>(module: string): Promise<T>;

    /**
     * check if a module is included in the scope
     * @template TKey name of module
     * @argument module name of the module
     */
    hasModule<TKey extends string = Extract<keyof Modules, string>>(module: TKey): boolean;
    hasModule(module: string): boolean;
};

/**
 * config builder callback function blueprint
 * @template TReturn expected return type of callback
 * @returns either a sync value or an observable input (async)
 */
export type ConfigBuilderCallback<TReturn = unknown> = (
    args: ConfigBuilderCallbackArgs,
) => TReturn | ObservableInput<TReturn>;

/**
 * template class for building module config
 *
 * @example
 * ```ts
 * type MyModuleConfig = {
 *      foo: string;
 *      bar?: number,
 *      nested?: { up: boolean }
 * };
 *
 * class MyModuleConfigurator extends BaseConfigBuilder<MyModuleConfig> {
 *   public setFoo(cb: ModuleConfigCallback<string>) {
 *       this._set('foo', cb);
 *   }
 *
 *   public setBar(cb: ModuleConfigCallback<number>) {
 *     this._set('bar', cb);
 *   }
 *
 *   public setUp(cb: ModuleConfigCallback<boolean>) {
 *     this._set('nested.up', cb);
 *   }
 * }
 * ```
 * @template TConfig expected config the builder will create
 */
export abstract class BaseConfigBuilder<TConfig extends object = Record<string, unknown>> {
    /** internal hashmap of registered callback functions */
    #configCallbacks = {} as Record<string, ConfigBuilderCallback>;

    /**
     * request the builder to generate config
     * @param init config builder callback arguments
     * @param initial optional initial config
     * @returns configuration object
     */
    public createConfig(
        init: ConfigBuilderCallbackArgs,
        initial?: Partial<TConfig>,
    ): Observable<TConfig> {
        return from(this._createConfig(init, initial));
    }

    /**
     * @see async version of {@link BaseConfigBuilder.createConfig}
     */
    public async createConfigAsync(
        init: ConfigBuilderCallbackArgs,
        initial?: Partial<TConfig>,
    ): Promise<TConfig> {
        return lastValueFrom(this.createConfig(init, initial));
    }

    /**
     * internally set configuration of a config attribute
     * @param target attribute name of config dot notaded
     * @param cb callback function for setting the attribute
     * @template TKey keyof config
     */
    protected _set<TTarget extends DotPath<TConfig>>(
        target: TTarget,
        cb: ConfigBuilderCallback<DotPathType<TConfig, TTarget>>,
    ) {
        this.#configCallbacks[target] = cb;
    }

    /**
     * Retrieves the configuration callback for the specified target path in the configuration.
     *
     * @param target - The target path in the configuration to retrieve the callback for.
     * @returns The configuration builder callback for the specified target, or `undefined` if no callback is registered.
     */
    protected _get<TTarget extends DotPath<TConfig>>(
        target: TTarget,
    ): ConfigBuilderCallback<DotPathType<TConfig, TTarget>> | undefined {
        return this.#configCallbacks[target] as ConfigBuilderCallback<
            DotPathType<TConfig, TTarget>
        >;
    }

    /**
     * Checks if the given target path exists in the configuration callbacks.
     * @param target - The target path to check.
     * @returns `true` if the target path exists in the configuration callbacks, `false` otherwise.
     */
    protected _has<TTarget extends DotPath<TConfig>>(target: TTarget): boolean {
        return target in this.#configCallbacks;
    }

    /**
     * @private internal creation of config
     */
    protected _createConfig(
        init: ConfigBuilderCallbackArgs,
        initial?: Partial<TConfig>,
    ): ObservableInput<TConfig> {
        return from(this._buildConfig(init, initial)).pipe(
        );
    }

    /**
     * @private internal builder
     */
    protected _buildConfig(
        init: ConfigBuilderCallbackArgs,
        initial?: Partial<TConfig>,
    ): ObservableInput<Partial<TConfig>> {
        return from(Object.entries<ConfigBuilderCallback>(this.#configCallbacks)).pipe(
            mergeMap(async ([target, cb]) => {
                const value = await cb(init);
                return { target, value };
            }),
            reduce(
                (acc, { target, value }) => assignConfigValue(acc, target, value),
                initial ?? ({} as TConfig),
            ),
        );
    }

    /**
     * internal post process of config creation.
     * override this method for post processing of config
     *
     * can be used for adding required config attributes which might not been
     * added config callbacks for
     */
    protected _processConfig(
        config: Partial<TConfig>,
        _init: ConfigBuilderCallbackArgs,
    ): ObservableInput<TConfig> {
        return of(config as TConfig);
    }
}
