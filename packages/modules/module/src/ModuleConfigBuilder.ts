import { AnyModule, CombinedModules, ModuleInitializerArgs, Modules, ModuleType } from './types';

/**
 * @deprecated @see {@link BaseConfigBuilder}
 */
export abstract class ModuleConfigBuilder<
    TModules extends Array<AnyModule> | unknown = unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TConfig = any,
> {
    #init: ModuleInitializerArgs<TConfig, CombinedModules<TModules, Array<Modules[keyof Modules]>>>;

    get config(): TConfig {
        return this._config;
    }

    constructor(
        init: ModuleInitializerArgs<
            TConfig,
            CombinedModules<TModules, Array<Modules[keyof Modules]>>
        >,
        protected _config: TConfig,
    ) {
        this.#init = init;
    }

    /**
     * require a module instance (provider).
     *
     * will try to await init of requested module
     *
     * @template TKey module key
     * @returns module instance
     */
    public requireInstance<TKey extends string = Extract<keyof Modules, string>>(
        module: TKey,
    ): Promise<ModuleType<Modules[TKey]>>;

    /**
     * require a module instance (provider).
     *
     * will try to await init of requested module
     *
     * @template T type cast module instance
     * @returns module instance
     */
    public requireInstance<T>(module: string): Promise<T>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public requireInstance(module: string): Promise<any> {
        return this.#init.requireInstance(module);
    }
}

export default ModuleConfigBuilder;
