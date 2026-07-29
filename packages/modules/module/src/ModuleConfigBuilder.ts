import type {
  AnyModule,
  CombinedModules,
  ModuleInitializerArgs,
  Modules,
  ModuleType,
} from './types.js';

/**
 * Legacy configuration builder that provides access to module initializer arguments.
 *
 * @deprecated Use {@link BaseConfigBuilder} instead. `BaseConfigBuilder` offers a
 * declarative, callback-driven approach to building module configuration with
 * support for dot-path targeting, observable pipelines, and post-processing hooks.
 *
 * @template TModules - Array of peer module dependencies.
 * @template TConfig - The configuration type managed by this builder.
 */
export abstract class ModuleConfigBuilder<
  TModules extends Array<AnyModule> | unknown = unknown,
  // biome-ignore lint/suspicious/noExplicitAny: generic config type needs flexibility
  TConfig = any,
> {
  #init: ModuleInitializerArgs<TConfig, CombinedModules<TModules, Array<Modules[keyof Modules]>>>;

  /**
   * The current configuration managed by this builder.
   *
   * @returns The current configuration value.
   */
  get config(): TConfig {
    return this._config;
  }

  /**
   * Creates a new `ModuleConfigBuilder`.
   *
   * @param init - The module initializer arguments, used to resolve peer module instances.
   * @param _config - The initial configuration value managed by this builder.
   */
  constructor(
    init: ModuleInitializerArgs<TConfig, CombinedModules<TModules, Array<Modules[keyof Modules]>>>,
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

  /**
   * Implementation signature for the `requireInstance` overloads above.
   *
   * @param module - The module key or identifier to require.
   * @returns A promise resolving to the requested module instance.
   */
  public requireInstance(
    module: string,
    // biome-ignore lint/suspicious/noExplicitAny: method overload requires any for flexibility
  ): Promise<any> {
    return this.#init.requireInstance(module);
  }
}

export default ModuleConfigBuilder;
