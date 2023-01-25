import { AnyModule, CombinedModules, ModuleInitializerArgs, Modules, ModuleType } from './types';

export abstract class ModuleConfigBuilder<
    TModules extends Array<AnyModule> | unknown = unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TConfig = any
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
        protected _config: TConfig
    ) {
        this.#init = init;
    }

    public requireInstance<TKey extends string = Extract<keyof Modules, string>>(
        module: TKey
    ): Promise<ModuleType<Modules[TKey]>>;

    public requireInstance<T>(module: string): Promise<T>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public requireInstance(module: string): Promise<any> {
        return this.#init.requireInstance(module);
    }
}

export default ModuleConfigBuilder;
