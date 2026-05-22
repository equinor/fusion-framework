import type { Observable } from 'rxjs';

import type {
  AnyModule,
  CombinedModules,
  ModuleConfigType,
  ModuleEvent,
  ModulesInstanceType,
  ModulesConfigType,
  ModulesInstance,
} from '../../types.js';

import type { IModuleConfigurator } from './IModuleConfigurator.js';

/**
 * Contract for the top-level module orchestrator in Fusion Framework.
 *
 * `IModulesConfigurator` defines the full configure → initialize → dispose
 * lifecycle for a set of modules. Implement or extend this interface to
 * control how modules are registered, configured, initialized, and torn down.
 *
 * @template TModules - The array of module descriptors managed by this configurator.
 * @template TRef - Optional reference object forwarded to module lifecycle hooks
 *   (e.g. a parent framework instance).
 */
export interface IModulesConfigurator<
  TModules extends Array<AnyModule> = Array<AnyModule>,
  TRef = unknown,
> {
  /** Semantic version of the module system. */
  readonly version: string;

  /** Observable stream of lifecycle events emitted during configure/initialize/dispose. */
  readonly event$: Observable<ModuleEvent>;

  /**
   * Registers one or more module configurators.
   *
   * Shorthand for calling {@link addConfig} for each entry.
   *
   * @param configs - One or more module configurator descriptors.
   */
  configure(...configs: Array<IModuleConfigurator<AnyModule, TRef>>): void;

  /**
   * Registers a single module configurator.
   *
   * Adds the module to the known module set and registers optional
   * `configure`, `afterConfig`, and `afterInit` lifecycle callbacks.
   *
   * @param config - The module configurator descriptor to register.
   * @template T - The module type being registered.
   * @template TConfig - The module's config builder type; defaults to `ModuleConfigType<T>`.
   *   Declared at the method level so TypeScript evaluates the default after inferring `T`,
   *   giving the `configure` callback its correct contextual parameter type without
   *   requiring an explicit annotation.
   */
  addConfig<T extends AnyModule, TConfig = ModuleConfigType<T>>(
    config: IModuleConfigurator<T, TRef, TConfig>,
  ): void;

  /**
   * Runs the full configure → initialize pipeline and returns a sealed
   * module instance.
   *
   * @param ref - Optional reference forwarded to all module lifecycle hooks.
   * @returns A promise resolving to the sealed, initialized module instance.
   * @template T - Additional modules to merge into the instance type.
   */
  initialize<T extends Array<AnyModule> | unknown>(
    ref?: TRef,
  ): Promise<ModulesInstance<CombinedModules<T, TModules>>>;

  /**
   * Registers a callback invoked after all modules have been configured
   * (post-configure phase).
   *
   * Use this to inspect or mutate config objects after all `configure`
   * callbacks have run.
   *
   * @param cb - Callback receiving the merged module config map.
   * @template T - Additional modules to include in the config type.
   */
  onConfigured<T>(
    cb: (config: ModulesConfigType<CombinedModules<T, TModules>>) => void | Promise<void>,
  ): void;

  /**
   * Registers a callback invoked after all modules have been initialized
   * (post-initialize phase).
   *
   * Use this to react to the fully initialized module instance.
   *
   * @param cb - Callback receiving the sealed module instance.
   * @template T - Additional modules to include in the instance type.
   */
  onInitialized<T extends Array<AnyModule> | unknown>(
    cb: (instance: ModulesInstanceType<CombinedModules<T, TModules>>) => void | Promise<void>,
  ): void;

  /**
   * Tears down the initialized module instance.
   *
   * Calls each module's `dispose` hook (if defined) and completes
   * the internal event stream.
   *
   * @param instance - The module instance to tear down.
   * @param ref - Optional reference forwarded to module dispose hooks.
   */
  dispose(instance: ModulesInstanceType<TModules>, ref?: TRef): Promise<void>;
}
