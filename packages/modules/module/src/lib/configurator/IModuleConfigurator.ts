import type { AnyModule, ModuleConfigType, ModuleInstance, ModuleType } from '../../types.js';

/**
 * Descriptor that wires a single module into the configurator lifecycle.
 *
 * Pass an `IModuleConfigurator` to {@link IModulesConfigurator.addConfig} or
 * {@link IModulesConfigurator.configure} to register a module together with
 * optional configure, post-configure, and post-initialize callbacks.
 *
 * @template TModule - The module type being configured.
 * @template TRef - Reference type provided during configuration (typically a parent module instance).
 * @template TConfig - The module's config builder type. Defaults to `ModuleConfigType<TModule>`.
 *   Exposed as an explicit generic so TypeScript 6's stricter conditional-type inference does not
 *   widen callback parameters to `any`; the default is evaluated at instantiation time (concrete)
 *   rather than inside the inference algorithm (abstract).
 *
 * @example
 * ```typescript
 * configurator.addConfig({
 *   module: httpModule,
 *   configure: (config) => {
 *     config.setBaseUrl('https://api.example.com');
 *   },
 *   afterInit: (provider) => {
 *     provider.defaultHeaders.set('X-App', 'my-app');
 *   },
 * });
 * ```
 */
export interface IModuleConfigurator<
  TModule extends AnyModule = AnyModule,
  TRef = ModuleInstance,
  TConfig = ModuleConfigType<TModule>,
> {
  /** The module definition to register. */
  module: TModule;

  /**
   * Callback invoked during the configure phase to mutate the module's
   * config builder.
   *
   * @param config - The module's config builder instance.
   * @param ref - Optional reference forwarded from the caller.
   */
  configure?: (config: TConfig, ref?: TRef) => void | Promise<void>;

  /**
   * Callback invoked after all modules have been configured (post-configure phase).
   *
   * @param config - The module's resolved config builder.
   */
  afterConfig?: (config: TConfig) => void;

  /**
   * Callback invoked after the module has been initialized with its provider instance.
   *
   * @param instance - The initialized module provider.
   */
  afterInit?: (instance: ModuleType<TModule>) => void | Promise<void>;
}
