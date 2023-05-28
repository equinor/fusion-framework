/* eslint-disable @typescript-eslint/no-explicit-any */

import SemanticVersion from './lib/semantic-version';
import { ObservableInput } from 'rxjs';

export type ModuleInitializerArgs<TConfig, TDeps extends Array<AnyModule> = []> = {
    ref?: any;
    config: TConfig;
    requireInstance: <TKey extends keyof ModulesInstanceType<TDeps>>(
        name: TKey,
        wait?: number
    ) => Promise<ModulesInstanceType<TDeps>[TKey]>;
    hasModule: (key: string) => boolean;
    // | ((key: Extract<keyof ModulesInstanceType<TDeps>, string>) => boolean)
};

/**
 * Interface which describes the structure of a module
 * 
 * @TODO create a BaseModule which implements this interface
 * 
 * @template TKey name of the module
 * @template TType module instance type
 * @template TConfig module configurator type
 * @template TDeps optional peer module dependencies
 */
export interface Module<TKey extends string, TType, TConfig, TDeps extends Array<AnyModule> = []> {
    /** 
     * package version 
     */
    version?: SemanticVersion;

    /** 
     * uniq name of module, used as attribute name on module instances 
     */
    name: TKey;

    /**
     * _[optional]_
     * 
     * Create a configurator builder which the consumer can use for configuring
     * 
     * @TODO change return type to `ObservableInput`
     * @TODO add reference to `IConfigurationBuilder`
     * 
     * @param ref this would normally be the parent instance
     * @returns a configurator build
     */
    configure?: (ref?: any) => TConfig | Promise<TConfig>;

    /**
     * _[optional]_
     * 
     * This method is called after the module initiator has created config.
     * @see {@link Module.configure}
     * 
     * @TODO change return type to `ObservableInput`
     * 
     * @param config 
     * @returns void
     */
    postConfigure?: (
        config: Record<TKey, TConfig> & ModulesConfigType<ModulesType<TDeps>>
    ) => void | Promise<void>;

    /**
     * __[required]__
     * 
     * Called after all configuration is done.
     * 
     * Creates the instance to interact with
     * 
     * @param args @see {@link ModuleInitializerArgs}
     * @returns a provider instance which the consumer interact with
     */
    initialize: (args: ModuleInitializerArgs<TConfig, TDeps>) => TType | Promise<TType>;

    /**
     * _[optional]_
     * 
     * Called after the module is initialized
     * 
     * @param args @see {@link ModuleInitializerArgs}
     */
    postInitialize?: (args: {
        ref?: any;
        instance: TType;
        modules: ModuleInstance; // Record<TKey, TType> & ModulesInstanceType<ModulesType<TDeps>>;
    }) => ObservableInput<void>;

    /**
     * _[optional]_
     * 
     * Cleanup callback
     * 
     * @param args 
     */
    dispose?: (args: {
        ref?: any;
        instance: TType;
        modules: Record<TKey, TType> & ModulesInstanceType<ModulesType<TDeps>>;
    }) => void | Promise<void>;
}

export type AnyModule = Module<any, any, any, any>;
export type CombinedModules<T1, T2> = T1 extends Array<AnyModule>
    ? T2 extends Array<AnyModule>
        ? [...T1, ...T2]
        : T1
    : T2 extends Array<AnyModule>
    ? T2
    : never;
export type AnyModuleInstance = Record<string, AnyModule>;
export type ModuleKey<M> = M extends Module<infer TKey, any, any, any> ? TKey : never;
export type ModuleType<M> = M extends Module<any, infer TType, any, any> ? TType : never;
export type ModuleTypes<M extends Array<AnyModule>> = M extends Array<infer U> ? U : never;
export type ModuleConfigType<M> = M extends Module<any, any, infer TType, any> ? TType : never;
export type ModulesInstance<TModules extends Array<AnyModule> | Record<string, AnyModule>> =
    ModulesInstanceType<TModules> & { dispose: VoidFunction };

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

type ModulesObjectInstanceType<TModule extends Record<string, AnyModule>> = {
    [TKey in keyof TModule as Extract<TKey, string>]: ModuleType<TModule[TKey]>;
};

type ModulesObjectConfigType<M extends Record<string, AnyModule>> = {
    [K in keyof M as Extract<K, string>]: ModuleConfigType<M[K]>;
};

/** === */

export type ModuleInstance = ModulesInstanceType<Modules>;

export interface ILogger {
    debug: (...msg: unknown[]) => void;
    info: (...msg: unknown[]) => void;
    warn: (...msg: unknown[]) => void;
    error: (...msg: unknown[]) => void;
}
