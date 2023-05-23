import { from, lastValueFrom, of, type Observable, type ObservableInput } from 'rxjs';
import { last, mergeMap, scan } from 'rxjs/operators';
import { Modules, ModuleType } from './types';

/**
 * callback arguments for config builder callback function
 * @template TRef parent instance
 */
export type ConfigBuilderCallbackArgs<TRef = unknown> = {
    /** reference, parent modules */
    ref?: TRef;

    /**
     * request a sibling module
     * @template TKey name of module
     * @argument module name of module
     */
    requireInstance<TKey extends string = Extract<keyof Modules, string>>(
        module: TKey
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
    args: ConfigBuilderCallbackArgs
) => TReturn | ObservableInput<TReturn>;

/**
 * template class for building module config
 *
 * __Limitations:__
 * this only allows configuring an attribute of config root level
 *
 * @example
 * ```ts
 * type MyModuleConfig = { foo: string; bar?: number };
 *
 * class MyModuleConfigurator extends BaseConfigBuilder<MyModuleConfig> {
 *   public setFoo(cb: ModuleConfigCallback<string>) {
 *       this._set('foo', cb);
 *   }
 *
 *   public setBar(cb: ModuleConfigCallback<number>) {
 *     this._set('bar', cb);
 *   }
 * }
 * ```
 * @template TConfig expected config the builder will create
 */
export abstract class BaseConfigBuilder<TConfig = unknown> {
    /** internal hashmap of registered callback functions */
    #configCallbacks = {} as Record<keyof TConfig, ConfigBuilderCallback>;

    /**
     * request the builder to generate config
     * @param init config builder callback arguments
     * @param initial optional initial config
     * @returns configuration object
     */
    public createConfig(
        init: ConfigBuilderCallbackArgs,
        initial?: Partial<TConfig>
    ): Observable<TConfig> {
        return this._createConfig(init, initial);
    }

    /**
     * @see async version of {@link BaseConfigBuilder.createConfig}
     */
    public async createConfigAsync(
        init: ConfigBuilderCallbackArgs,
        initial?: Partial<TConfig>
    ): Promise<TConfig> {
        return lastValueFrom(this.createConfig(init, initial));
    }

    /**
     * internally set configuration of a config attribute
     * @param target attribute name of config
     * @param cb callback function for setting the attribute
     * @template TKey keyof config (attribute name
     */
    protected _set<TKey extends keyof TConfig>(
        target: TKey,
        cb: ConfigBuilderCallback<TConfig[TKey]>
    ) {
        this.#configCallbacks[target] = cb;
    }

    /**
     * @private internal creation of config
     */
    protected _createConfig(
        init: ConfigBuilderCallbackArgs,
        initial?: Partial<TConfig>
    ): Observable<TConfig> {
        return this._buildConfig(init, initial).pipe(
            mergeMap((config) => this._processConfig(config))
        );
    }

    /**
     * @private internal builder
     */
    protected _buildConfig(
        init: ConfigBuilderCallbackArgs,
        initial?: Partial<TConfig>
    ): Observable<Partial<TConfig>> {
        return from(Object.entries<ConfigBuilderCallback>(this.#configCallbacks)).pipe(
            mergeMap(async ([target, cb]) => {
                const value = await cb(init);
                return { target, value };
            }),
            scan(
                (acc, { target, value }) => Object.assign({}, acc, { [target]: value }),
                initial ?? ({} as TConfig)
            ),
            last()
        );
    }

    /**
     * internal post process of config creation.
     * override this method for post processing of config
     *
     * can be used for adding required config attributes which might not been
     * added config callbacks for
     */
    protected _processConfig(config: Partial<TConfig>): ObservableInput<TConfig> {
        return of(config as TConfig);
    }
}
