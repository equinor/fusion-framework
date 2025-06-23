import { EMPTY, from, lastValueFrom, of, type Observable, type ObservableInput } from 'rxjs';
import { catchError, filter, map, mergeMap, reduce, switchMap } from 'rxjs/operators';
import type { Modules, ModuleType } from './types';
import type { DotPathType, DotPathUnion } from './utils/dot-path';

/**
 * Recursively assigns a configuration value to a nested object property.
 *
 * This helper function is used to set a value in a nested object structure, creating
 * intermediate objects as needed. It supports dot-separated property paths to access
 * deeply nested properties.
 *
 * @param obj - The object to assign the value to.
 * @param prop - The property path, either as a string with dot-separated parts or an array of property names.
 * @param value - The value to assign.
 * @returns The modified object.
 */
const assignConfigValue = <T>(
  obj: Record<string, unknown>,
  prop: string | string[],
  value: unknown,
): T => {
  // Split the property path into individual parts
  const props = typeof prop === 'string' ? prop.split('.') : prop;

  // Get the first property in the path
  const attr = props.shift();

  // If there is a property to process
  if (attr) {
    // Create the nested object if it doesn't exist
    obj[attr] ??= {};

    // If there are more properties in the path, recurse
    props.length
      ? assignConfigValue(obj[attr] as Record<string, unknown>, props, value)
      : Object.assign(obj, { [attr]: value });
  }

  // Return the modified object
  return obj as T;
};

/**
 * Defines the arguments passed to a configuration builder callback function.
 *
 * @template TConfig - The type of the configuration object.
 * @template TRef - The type of the reference or parent module.
 */
export type ConfigBuilderCallbackArgs<TConfig = unknown, TRef = unknown> = {
  config: TConfig;

  /** reference, parent modules */
  ref?: TRef;

  /**
   * request a sibling module
   * @template TKey name of module
   * @param module name of module
   */
  requireInstance<TKey extends string = Extract<keyof Modules, string>>(
    module: TKey,
  ): Promise<ModuleType<Modules[TKey]>>;

  /**
   * request a sibling module
   * @template T module type
   * @param module name of module
   */
  requireInstance<T>(module: string): Promise<T>;

  /**
   * check if a module is included in the scope
   * @template TKey name of module
   * @param module name of the module
   */
  hasModule<TKey extends string = Extract<keyof Modules, string>>(module: TKey): boolean;
  hasModule(module: string): boolean;
};

/**
 * Represents a callback function used in the ConfigBuilder.
 *
 * The callback function receives the `ConfigBuilderCallbackArgs` as an argument and returns an `Observable` that emits the return value of the callback function or void.
 * Return void or undefined to skip providing a value for the configuration attribute.
 *
 * @example
 * ```typescript
 * const callback: ConfigBuilderCallback<string> = async(args) => {
 *  if(args.hasModule('some_module')){
 *    const someModule = await args.requireInstance('some_module');
 *    return someModule.doSomething();
 *  }
 *  // will not provide a value for the configuration attribute
 * };
 * ```
 *
 * @template TReturn The return type of the callback function.
 * @param args The arguments passed to the callback function.
 * @returns An Observable that emits the return value of the callback function or void.
 */
export type ConfigBuilderCallback<TReturn = unknown> = (
  args: ConfigBuilderCallbackArgs,
  // biome-ignore lint/suspicious/noConfusingVoidType: not confusing in this context
) => ObservableInput<TReturn | void>;

/**
 * The `BaseConfigBuilder` class is an abstract class that provides a flexible and extensible way to build and configure modules.
 * It allows you to define configuration callbacks for different parts of your module's configuration,
 * and then combine and process these callbacks to generate the final configuration object.
 *
 * The config builder will be the interface consumers of the module will use to configure the module.
 *
 * The config builder is designed to be used in the following way:
 *
 * @example
 * Imagine you have a module called `MyModule` that requires a configuration object with the following structure:
 *
 * ```typescript
 * type MyModuleConfig = {
 *   foo: string;
 *   bar?: number;
 *   nested?: { up: boolean };
 * };
 * ```
 *
 * You can create a configuration builder for this module by extending the `BaseConfigBuilder` class:
 *
 * ```typescript
 * import { BaseConfigBuilder, ConfigBuilderCallback } from '@equinor/fusion-framework';
 *
 * class MyModuleConfigurator extends BaseConfigBuilder<MyModuleConfig> {
 *   public setFoo(cb: ConfigBuilderCallback<string>) {
 *     this._set('foo', cb);
 *   }
 *
 *   public setBar(cb: ConfigBuilderCallback<number>) {
 *     this._set('bar', cb);
 *   }
 *
 *   public setUp(cb: ConfigBuilderCallback<boolean>) {
 *     this._set('nested.up', cb);
 *   }
 * }
 * ```
 *
 * In this example, we define three methods (`setFoo`, `setBar`, and `setUp`) that allow us to set configuration callbacks for different parts of the `MyModuleConfig` object.
 * These methods use the `_set` method provided by the `BaseConfigBuilder` class to register the callbacks.
 *
 * To create the final configuration object, you can use the `createConfig` or `createConfigAsync` methods provided by the `BaseConfigBuilder` class:
 *
 * ```typescript
 * import { configure } from './configure';
 *
 * const configurator = new MyModuleConfigurator();
 * const config = await configurator.createConfigAsync(configure);
 * ```
 *
 * The `configure` function is where you define the actual configuration callbacks. For example:
 *
 * ```typescript
 * import type { ModuleInitializerArgs } from '@equinor/fusion-framework';
 *
 * export const configure: ModuleInitializerArgs<MyModuleConfig> = (configurator) => {
 *   configurator.setFoo(async () => 'https://foo.bar');
 *   configurator.setBar(() => 69);
 *   configurator.setUp(() => true);
 * };
 * ```
 *
 * In this example, we define the configuration callbacks for the `foo`, `bar`, and `nested.up` properties of the `MyModuleConfig` object.
 *
 * The `BaseConfigBuilder` class provides several methods and properties to help you build and process the configuration object:
 *
 * - `createConfig`: Returns an observable that emits the final configuration object.
 * - `createConfigAsync`: Returns a promise that resolves with the final configuration object.
 * - `_set`: Registers a configuration callback for a specific target path in the configuration object.
 * - `_buildConfig`: Builds the configuration object by executing all registered configuration callbacks and merging the results.
 * - `_processConfig`: Allows you to perform post-processing on the built configuration object before returning it.
 *
 * You can override the `_processConfig` method to add additional logic or validation to the configuration object before it is returned.
 *
 */
export abstract class BaseConfigBuilder<TConfig extends object = Record<string, unknown>> {
  /** internal hashmap of registered callback functions */
  #configCallbacks = {} as Record<string, ConfigBuilderCallback>;

  /**
   * request the builder to generate config
   * @param init config builder callback arguments
   * @param initial optional initial config
   * @returns observable configuration object
   * @sealed
   */
  public createConfig(
    init: ConfigBuilderCallbackArgs,
    initial?: Partial<TConfig>,
  ): Observable<TConfig> {
    return from(this._createConfig(init, initial));
  }

  /**
   * Asynchronously creates a configuration object of type `TConfig` based on the provided `init` callback and optional `initial` partial configuration.
   *
   * @see async version of {@link BaseConfigBuilder.createConfig}
   * @param init - A callback function that is responsible for initializing the configuration object.
   * @param initial - An optional partial configuration object that will be merged with the result of the `init` callback.
   * @returns A Promise that resolves to the created configuration object of type `TConfig`.
   * @protected
   * @sealed
   */
  public async createConfigAsync(
    init: ConfigBuilderCallbackArgs,
    initial?: Partial<TConfig>,
  ): Promise<TConfig> {
    return lastValueFrom(this.createConfig(init, initial));
  }

  /**
   * Sets a configuration value or a callback for a specific dot-path target within the configuration object.
   *
   * @typeParam TTarget - The dot-path string representing the target property in the configuration.
   * @param target - The dot-path key indicating where in the configuration the value or callback should be set.
   * @param value_or_cb - Either a direct value to set at the target location, or a callback function that returns the value (possibly asynchronously).
   *
   * @remarks
   * If a function is provided as `value_or_cb`, it will be used as a callback for deferred or computed configuration values.
   * Otherwise, the value is wrapped in an async function for consistency.
   *
   * @protected
   * @sealed
   */
  protected _set<TTarget extends DotPathUnion<TConfig>>(
    target: TTarget,
    value_or_cb:
      | DotPathType<TConfig, TTarget>
      | ConfigBuilderCallback<DotPathType<TConfig, TTarget>>,
  ) {
    const cb = typeof value_or_cb === 'function' ? value_or_cb : async () => value_or_cb;
    this.#configCallbacks[target] = cb;
  }

  /**
   * Retrieves the configuration callback for the specified target path in the configuration.
   *
   * @param target - The target path in the configuration to retrieve the callback for.
   * @returns The configuration builder callback for the specified target, or `undefined` if no callback is registered.
   * @protected
   * @sealed
   */
  protected _get<TTarget extends DotPathUnion<TConfig>>(
    target: TTarget,
  ): ConfigBuilderCallback<DotPathType<TConfig, TTarget>> | undefined {
    return this.#configCallbacks[target] as ConfigBuilderCallback<DotPathType<TConfig, TTarget>>;
  }

  /**
   * Checks if the given target path exists in the configuration callbacks.
   * @param target - The target path to check.
   * @returns `true` if the target path exists in the configuration callbacks, `false` otherwise.
   * @protected
   * @sealed
   */
  protected _has<TTarget extends DotPathUnion<TConfig>>(target: TTarget): boolean {
    return target in this.#configCallbacks;
  }

  /**
   * Builds and processes the configuration object by executing all registered configuration callbacks, merging the results and post-processing the result.
   *
   * @example
   * ```ts
   * _createConfig(init, initial) {
   *   if(!(this._has('foo.bar') || initial?.foo?.bar)){
   *     console.warn(`'foo.bar' is not configured, adding default value`);
   *     this._set('foo.bar', async(args) => {
   *        if(!args.hasModule('some_module')){
   *           throw Error(`'some_module' is not configured`);
   *        }
   *        const someModule = await arg.requireInstance('some_module');
   *        return someModule.doSomething();
   *     });
   *   }
   *   super._createConfig(init, initial);
   * }
   * ```
   *
   * @param init - The configuration builder callback arguments, which include the module context and other relevant data.
   * @param initial - An optional partial configuration object to use as the initial base for the configuration.
   * @returns An observable that emits the processed configuration.
   * @protected
   */
  protected _createConfig(
    init: ConfigBuilderCallbackArgs,
    initial?: Partial<TConfig>,
  ): ObservableInput<TConfig> {
    // Build the initial configuration and then process it
    return from(this._buildConfig(init, initial)).pipe(
      // Process the built configuration with the provided initialization arguments
      switchMap((config) => this._processConfig(config, init)),
    );
  }

  /**
   * Builds the configuration object by executing all registered configuration callbacks and merging the results.
   *
   * @remarks overriding this method is not recommended, use {@link BaseConfigBuilder._createConfig} instead.
   * - use {@link BaseConfigBuilder._createConfig} to add custom initialization logic before building the configuration.
   * - use {@link BaseConfigBuilder._processConfig} to validate and post-process the configuration.
   *
   *
   * @param init - The initialization arguments passed to the configuration callbacks.
   * @param initial - An optional partial configuration object to use as the initial state.
   * @returns An observable that emits the final configuration object.
   * @protected
   * @sealed
   * @readonly
   */
  protected _buildConfig(
    init: ConfigBuilderCallbackArgs,
    initial?: Partial<TConfig>,
  ): ObservableInput<Partial<TConfig>> {
    return from(Object.entries<ConfigBuilderCallback>(this.#configCallbacks)).pipe(
      // Transform each config callback into a target-value pair
      mergeMap(([target, cb]) =>
        from(cb(init)).pipe(
          // Filter out undefined values, mostly for void return types
          filter((value) => value !== undefined),
          // Map the value to a target-value pair
          map((value) => ({ target, value })),
          catchError((error) => {
            console.error(
              `Failed to execute config callback: ${cb.name} for attribute: '${target}'`,
              error,
            );
            return EMPTY;
          }),
        ),
      ),
      // Reduce the target-value pairs into a single configuration object
      reduce(
        // Assign each value to the corresponding target in the accumulator
        (acc, { target, value }) => assignConfigValue(acc, target, value),
        // Initialize accumulator with initial config or empty object
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
   *
   * @example
   * ```ts
   * protected _processConfig(config, init) {
   *     if(!config.foo){
   *         config.foo = 1;
   *     } elseif(!isNaN(config.foo)) {
   *       throw Error(`'foo' is not a number`);
   *     } elseif(config.foo < 0) {
   *       throw Error(`'foo' is negative`);
   *     } elseif(config.foo > 100) {
   *       throw Error(`'foo' is too large`);
   *     }
   *     return config;
   * }
   * ```
   *
   * @param config - The partial configuration object to process.
   * @param _init - Additional configuration arguments (not used in this implementation).
   * @returns An observable input that emits the processed configuration object.
   * @protected
   */
  protected _processConfig(
    config: Partial<TConfig>,
    _init: ConfigBuilderCallbackArgs,
  ): ObservableInput<TConfig> {
    return of(config as TConfig);
  }
}
