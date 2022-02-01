/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Module<TKey extends string, TType, TConfig, TDeps extends Array<AnyModule> = []> {
    name: TKey;
    configure?: (ref?: any) => TConfig | Promise<TConfig>;
    postConfigure?: (
        config: Record<TKey, TConfig> & ModulesConfigType<ModulesType<TDeps>>
    ) => void | Promise<void>;
    initialize: (
        config: Record<TKey, TConfig> & ModulesConfigType<ModulesType<TDeps>>,
        instance: Record<TKey, TType> & ModulesInstanceType<ModulesType<TDeps>>
    ) => TType;
    postInitialize?: (
        modules: Record<TKey, TType> & ModulesInstanceType<ModulesType<TDeps>>
    ) => void | Promise<void>;
}

export type AnyModule = Module<any, any, any, any>;
export type ModuleKey<M> = M extends Module<infer TKey, any, any, any> ? TKey : never;
export type ModuleType<M> = M extends Module<any, infer TType, any, any> ? TType : never;
export type ModuleConfigType<M> = M extends Module<any, any, infer TType, any> ? TType : never;

export interface Modules {
    [Key: string]: AnyModule;
}

export type ModulesType<M extends Array<AnyModule>> = M extends Array<AnyModule>
    ? {
          [K in keyof M as M[K] extends Module<infer T, any, any, any> ? T : never]: M[Extract<
              K,
              string
          >];
      }
    : never;

export interface ModulesConfigurator<
    TModules extends Array<AnyModule>,
    TRef extends any = ModuleInstance
> {
    (config: ModulesConfig<ModulesType<TModules>>, ref?: TRef): void | Promise<void>;
}

/** Extract configs from modules  */
export type ModulesConfigType<TModules extends Array<AnyModule> | Record<string, AnyModule>> =
    TModules extends Array<AnyModule>
        ? ModulesObjectConfigType<ModulesType<TModules>>
        : TModules extends Record<string, AnyModule>
        ? ModulesObjectConfigType<TModules>
        : never;

export type ModulesInstanceType<TModules extends Array<AnyModule> | Record<string, AnyModule>> =
    TModules extends Array<AnyModule>
        ? ModulesObjectInstanceType<ModulesType<TModules>>
        : TModules extends Record<string, AnyModule>
        ? ModulesObjectInstanceType<TModules>
        : never;

export interface IModulesConfig<M extends Array<AnyModule> | Record<string, AnyModule>> {
    onAfterConfiguration: (cb: (config: ModulesConfigType<M>) => void | Promise<void>) => void;
    onAfterInit: (cb: (instance: ModulesInstanceType<M>) => void | Promise<void>) => void;
}

export type ModulesConfig<M extends Array<AnyModule> | Record<string, AnyModule>> =
    ModulesConfigType<M> & IModulesConfig<M>;

/** === Internal helpers === */

type ModulesObjectInstanceType<M extends Record<string, AnyModule>> = {
    [K in keyof M as Extract<K, string>]: ModuleType<M[K]>;
};

type ModulesObjectConfigType<M extends Record<string, AnyModule>> = {
    [K in keyof M as Extract<K, string>]: ModuleConfigType<M[K]>;
};

/** === */

export type ModuleInstance = ModulesInstanceType<Modules>;
