/* eslint-disable @typescript-eslint/no-explicit-any */

import type SemanticVersion from './lib/semantic-version.js';
import type { ObservableInput } from 'rxjs';

/**
 * Arguments passed to a module initializer function.
 *
 * @template TConfig - The type of the module's configuration object.
 * @template TDeps - An array of module dependencies, each extending `AnyModule`. Defaults to an empty array.
 *
 * @property ref - Optional reference for internal use.
 * @property config - The configuration object for the module.
 * @property requireInstance - Function to asynchronously retrieve an instance of a required dependency module by name.
 *   @param name - The key of the dependency module to retrieve.
 *   @param wait - Optional timeout in milliseconds to wait for the module instance.
 *   @returns A promise resolving to the instance of the requested dependency module.
 * @property hasModule - Function to check if a module with the given key exists.
 *   @param key - The key of the module to check.
 *   @returns `true` if the module exists, otherwise `false`.
 */
export type ModuleInitializerArgs<TConfig, TDeps extends Array<AnyModule> = []> = {
  ref?: any;
  config: TConfig;
  requireInstance: <TKey extends keyof ModulesInstanceType<TDeps>>(
    name: TKey,
    wait?: number,
  ) => Promise<ModulesInstanceType<TDeps>[TKey]>;
  hasModule: (key: string) => boolean;
};

// @todo - create a BaseModule which implements this interface

/**
 * Interface which describes the structure of a module
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
   * @param ref this would normally be the parent instance
   * @returns a configurator build
   */
  // @todo - change return type to `ObservableInput`
  // @todo - add reference to `IConfigurationBuilder`
  configure?: (ref?: any) => TConfig | Promise<TConfig>;

  /**
   * _[optional]_
   *
   * This method is called after the module initiator has created config.
   * @see {@link Module.configure}
   *
   * @param config
   * @returns void
   */
  // @todo - change return type to `ObservableInput`
  postConfigure?: (
    config: Record<TKey, TConfig> & ModulesConfigType<ModulesType<TDeps>>,
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

/**
 * Represents a module with any type of configuration, state, dependencies, and services.
 *
 * This type is a generic alias for the `Module` type with all type parameters set to `any`,
 * allowing for maximum flexibility when the specific types are not known or not important.
 *
 * @see Module
 */
export type AnyModule = Module<any, any, any, any>;

/**
 * Combines two module type arrays into a single tuple type.
 *
 * - If both `T1` and `T2` are arrays of `AnyModule`, returns a tuple with all elements from `T1` followed by all elements from `T2`.
 * - If only `T1` is an array of `AnyModule`, returns `T1`.
 * - If only `T2` is an array of `AnyModule`, returns `T2`.
 * - Otherwise, returns `never`.
 *
 * @typeParam T1 - The first module type or array of modules.
 * @typeParam T2 - The second module type or array of modules.
 */
export type CombinedModules<T1, T2> = T1 extends Array<AnyModule>
  ? T2 extends Array<AnyModule>
    ? [...T1, ...T2]
    : T1
  : T2 extends Array<AnyModule>
    ? T2
    : never;

/**
 * Represents an object whose properties are strings mapped to `AnyModule` instances.
 * This type is useful for defining collections of modules indexed by string keys.
 */
export type AnyModuleInstance = Record<string, AnyModule>;

/**
 * Extracts the key type (`TKey`) from a `Module` type.
 *
 * @typeParam M - The `Module` type to extract the key from.
 * @returns The key type (`TKey`) if `M` extends `Module`, otherwise `never`.
 */
export type ModuleKey<M> = M extends Module<infer TKey, any, any, any> ? TKey : never;

/**
 * Extracts the `TType` type parameter from a `Module` type.
 *
 * Given a type `M` that extends `Module<any, TType, any, any>`, this utility type
 * will resolve to the `TType` parameter of that `Module`. If `M` does not match
 * the expected `Module` structure, it resolves to `never`.
 *
 * @template M - The type to extract the module type from.
 */
export type ModuleType<M> = M extends Module<any, infer TType, any, any> ? TType : never;

/**
 * Extracts the union of module types from an array of modules.
 *
 * @typeParam M - An array of modules extending `AnyModule`.
 * @returns The union type of all elements in the array `M`.
 *
 * @example
 * type MyModules = [ModuleA, ModuleB];
 * type Result = ModuleTypes<MyModules>; // Result is ModuleA | ModuleB
 */
export type ModuleTypes<M extends Array<AnyModule>> = M extends Array<infer U> ? U : never;

/**
 * Extracts the configuration type (`TType`) from a `Module` type.
 *
 * @typeParam M - The module type to extract the configuration type from.
 * @returns The configuration type (`TType`) if `M` extends `Module<any, any, TType, any>`, otherwise `never`.
 */
export type ModuleConfigType<M> = M extends Module<any, any, infer TType, any> ? TType : never;

/**
 * Represents an instance of modules, providing both the resolved module types and a `dispose` method for cleanup.
 *
 * @typeParam TModules - The collection of modules, either as an array or a record of modules.
 * @see ModulesInstanceType
 * @see AnyModule
 */
export type ModulesInstance<TModules extends Array<AnyModule> | Record<string, AnyModule>> =
  ModulesInstanceType<TModules> & { dispose: VoidFunction };

/**
 * Represents a collection of modules, where each property key is a string identifier
 * and the value is an `AnyModule` instance.
 *
 * @remarks
 * This interface is typically used to define a mapping of module names to their corresponding module implementations.
 *
 * @example
 * ```typescript
 * const modules: Modules = {
 *   user: userModule,
 *   auth: authModule,
 * };
 * ```
 */
export interface Modules {
  [Key: string]: AnyModule;
}

/**
 * Maps an array of modules to an object type whose keys are the first generic parameter (`T`)
 * of each `Module` in the array, and whose values are the corresponding module instances.
 *
 * @template M - An array of modules extending `AnyModule`.
 * @typeParam M - The array of modules to be mapped.
 * @returns An object type where each key is the unique identifier (`T`) of a module,
 * and each value is the corresponding module instance from the array.
 */
export type ModulesType<M extends Array<AnyModule>> = M extends Array<AnyModule>
  ? {
      [K in keyof M as M[K] extends Module<infer T, any, any, any> ? T : never]: M[Extract<
        K,
        string
      >];
    }
  : never;

/**
 * Infers the configuration object type for a given set of modules.
 *
 * Accepts either an array of modules or a record (object) of modules, and produces
 * the corresponding configuration object type for those modules.
 *
 * - If `TModules` is an array of modules, it maps the array to an object type using `ModulesType<TModules>`.
 * - If `TModules` is a record of modules, it uses the record type directly.
 * - Otherwise, resolves to `never`.
 *
 * @typeParam TModules - An array or record of modules extending `AnyModule`.
 * @see ModulesObjectConfigType
 * @see ModulesType
 */
export type ModulesConfigType<TModules extends Array<AnyModule> | Record<string, AnyModule>> =
  TModules extends Array<AnyModule>
    ? ModulesObjectConfigType<ModulesType<TModules>>
    : TModules extends Record<string, AnyModule>
      ? ModulesObjectConfigType<TModules>
      : never;

/**
 * Infers the instance type for a collection of modules, supporting both arrays and objects.
 *
 * - If `TModules` is an array of modules, resolves to the instance type of the corresponding modules object.
 * - If `TModules` is an object mapping strings to modules, resolves to the instance type of that object.
 * - Otherwise, resolves to `never`.
 *
 * @typeParam TModules - An array or object of modules to infer instance types from.
 */
export type ModulesInstanceType<TModules extends Array<AnyModule> | Record<string, AnyModule>> =
  TModules extends Array<AnyModule>
    ? ModulesObjectInstanceType<ModulesType<TModules>>
    : TModules extends Record<string, AnyModule>
      ? ModulesObjectInstanceType<TModules>
      : never;

/**
 * Interface for configuring modules and registering lifecycle callbacks.
 *
 * @typeParam M - A collection of modules, either as an array or a record.
 *
 * @property onAfterConfiguration - Registers a callback to be invoked after the modules' configuration phase.
 * The callback receives the resolved configuration for the modules.
 *
 * @property onAfterInit - Registers a callback to be invoked after the modules have been initialized.
 * The callback receives the initialized module instances.
 */
export interface IModulesConfig<M extends Array<AnyModule> | Record<string, AnyModule>> {
  onAfterConfiguration: (cb: (config: ModulesConfigType<M>) => void | Promise<void>) => void;
  onAfterInit: (cb: (instance: ModulesInstanceType<M>) => void | Promise<void>) => void;
}

/**
 * Represents the configuration type for a collection of modules.
 *
 * @typeParam M - An array or record of modules extending `AnyModule`.
 * @see ModulesConfigType
 * @see IModulesConfig
 */
export type ModulesConfig<M extends Array<AnyModule> | Record<string, AnyModule>> =
  ModulesConfigType<M> & IModulesConfig<M>;

/** === Utility types === */

/**
 * Maps the keys of a given modules object to their corresponding module instance types.
 *
 * @template TModule - An object type where each property is a module.
 * @remarks
 * This utility type iterates over the keys of `TModule`, extracting only string keys,
 * and produces a new type where each key is associated with the result of `ModuleType`
 * applied to the corresponding module.
 *
 * @example
 * type MyModules = { foo: SomeModule; bar: AnotherModule };
 * type Instances = ModulesObjectInstanceType<MyModules>;
 * // Equivalent to: { foo: ModuleType<SomeModule>; bar: ModuleType<AnotherModule> }
 */
export type ModulesObjectInstanceType<TModule extends Record<string, AnyModule>> = {
  [TKey in keyof TModule as Extract<TKey, string>]: ModuleType<TModule[TKey]>;
};

/**
 * Maps an object of modules to their corresponding configuration types.
 *
 * @template M - An object type where each property is a module extending `AnyModule`.
 * @remarks
 * For each key in `M` that is a string, this type produces a property with the same key,
 * whose value is the configuration type for the corresponding module.
 *
 * @example
 * ```typescript
 * type MyModules = { foo: FooModule; bar: BarModule };
 * type MyConfigs = ModulesObjectConfigType<MyModules>;
 * // Result: { foo: ModuleConfigType<FooModule>; bar: ModuleConfigType<BarModule> }
 * ```
 */
export type ModulesObjectConfigType<M extends Record<string, AnyModule>> = {
  [K in keyof M as Extract<K, string>]: ModuleConfigType<M[K]>;
};

/** === */

/**
 * Represents an instance of the modules defined by the `Modules` type.
 * This type is resolved using the `ModulesInstanceType` utility, which maps the module definitions
 * to their corresponding instance types.
 *
 * @see Modules
 * @see ModulesInstanceType
 */
export type ModuleInstance = ModulesInstanceType<Modules>;

/**
 * Defines the severity levels for module events.
 * Used to categorize events by their importance and impact.
 * Matches the TelemetryLevel enum sequence for consistency.
 */
export enum ModuleEventLevel {
  /** Debug events that provide detailed internal information for troubleshooting */
  Debug = 0,
  /** Information events that provide general operational details */
  Information = 1,
  /** Warning events that indicate potential issues but don't prevent operation */
  Warning = 2,
  /** Error events that indicate failures or critical issues */
  Error = 3,
  /** Critical events that indicate severe failures */
  Critical = 4,
}

/**
 * Represents an event emitted during module configuration and initialization.
 * Provides structured information about the module lifecycle, performance metrics,
 * and any errors that occur during the process.
 */
export type ModuleEvent = {
  /** The severity level of the event */
  level: ModuleEventLevel;

  /** A unique identifier for the event type (e.g., 'initialize', 'moduleConfigAdded') */
  name: string;

  /** A human-readable description of what occurred */
  message: string;

  /** Additional contextual data related to the event */
  // biome-ignore lint/suspicious/noExplicitAny: any is used here to allow flexibility in the properties
  properties?: Record<string, any>;

  /** Error object if the event is related to a failure */
  error?: unknown;

  /** Performance metric value (e.g., timing in milliseconds) */
  metric?: number;
};
