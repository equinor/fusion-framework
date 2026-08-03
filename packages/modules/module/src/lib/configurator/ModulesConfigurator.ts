// biome-ignore-all lint/suspicious/noExplicitAny: internal type-erased dispatch arrays — callbacks are registered with concrete module types but stored erased; the orchestrator never inspects these shapes itself
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReplaySubject } from 'rxjs';

import {
  ModuleEventLevel,
  type AnyModule,
  type CombinedModules,
  type ModuleConfigType,
  type ModuleEvent,
  type ModulesConfig,
  type ModulesConfigType,
  type ModulesInstance,
  type ModulesInstanceType,
} from '../../types.js';

import type {
  IModuleConfigurator,
  IModulesConfigurator,
  ModulesConfiguratorConfigCallback,
} from './types.js';

type QualifiedConfigCallback<TRef> = ModulesConfiguratorConfigCallback<TRef> & {
  moduleName?: string;
};

type QualifiedPostConfigCallback = ((config: any) => void | Promise<void>) & {
  moduleName?: string;
};

type QualifiedPostInitCallback = ((instance: any) => void | Promise<void>) & {
  moduleName?: string;
};
import type { FrameworkPluginCallback, FrameworkPluginTeardown } from '../plugin/index.js';

import { runConfigurePhase } from './phases/run-configure-phase.js';
import { runInitializePhase } from './phases/run-initialize-phase.js';
import { runPostInitializePhase } from './phases/run-post-initialize-phase.js';
import { runPluginPhase } from './phases/run-plugin-phase.js';
import { runDisposePhase } from './phases/run-dispose-phase.js';
import { version } from '../../version.js';
import { ModuleConfiguratorEventName } from './module-configurator-event-name.js';

/**
 * Core orchestrator that drives the module lifecycle in Fusion Framework.
 *
 * `ModulesConfigurator` manages the full **configure → post-configure → initialize →
 * post-initialize → plugin → dispose** pipeline for a set of modules. Consumers
 * register modules via {@link addConfig} or {@link configure}, then call
 * {@link initialize} to produce a sealed {@link ModulesInstance} whose properties
 * are the initialized module providers.
 *
 * ### Lifecycle phases (in execution order)
 *
 * | # | Phase | Entry point | Description |
 * |---|-------|-------------|-------------|
 * | 1 | **Configure** | `_configure` | Each module's `configure()` factory creates a config builder; registered callbacks mutate it. |
 * | 2 | **Post-configure** | `_postConfigure` (inside `_configure`) | `postConfigure()` hooks and `onConfigured` callbacks run. |
 * | 3 | **Initialize** | `_initialize` | Modules are initialized concurrently; cross-module dependencies are resolved through `requireInstance`. |
 * | 4 | **Post-initialize** | `_postInitialize` | `postInitialize()` hooks and `onInitialized` callbacks run. |
 * | 5 | **Plugin** | `_registerPlugins` (inside `initialize`) | Registered application plugins connect side effects after modules are ready. |
 * | 6 | **Dispose** | `dispose` | Plugin teardowns and module `dispose()` hooks run; the event stream is completed. |
 *
 * ### Registering phase callbacks
 *
 * - **Per-module callbacks**: use `addConfig({ module, configure, afterConfig, afterInit })`.
 * - **Global post-configure**: use `onConfigured(cb)`.
 * - **Global post-initialize**: use `onInitialized(cb)`.
 * - **Plugins**: use `registerPlugin(cb)` to connect side effects before render.
 *
 * All lifecycle transitions emit {@link ModuleEvent} entries on the {@link event$}
 * observable for telemetry and debugging.
 *
 * @template TModules - Tuple of module types managed by this configurator.
 * @template TRef - Reference type passed through configuration (usually a parent instance).
 *
 * @example
 * ```typescript
 * const configurator = new ModulesConfigurator([httpModule, authModule]);
 * configurator.addConfig({
 *   module: httpModule,
 *   configure: (cfg) => cfg.setBaseUrl('https://api.example.com'),
 * });
 * const modules = await configurator.initialize();
 * // modules.http, modules.auth are now available
 * ```
 */
export class ModulesConfigurator<
  TModules extends Array<AnyModule> = Array<AnyModule>,
  TRef = unknown,
> implements IModulesConfigurator<TModules, TRef>
{
  /**
   * Class name used as a namespace prefix for all emitted lifecycle events.
   * Preserved as a static string so minification cannot change it at runtime.
   */
  static readonly className: string = 'ModulesConfigurator';

  /**
   * The current package version of the module configurator.
   *
   * @returns The semantic version string.
   */
  get version(): string {
    return version;
  }

  // Buffer up to 100 events to prevent memory leaks while ensuring telemetry
  // can capture events that fire before a telemetry subscriber attaches.
  // mapConfiguratorEvents relies on replay to receive events emitted during
  // configuration before telemetry is wired up.
  // Memory bound: ~24 KB at ~240 bytes/event × 100 events.
  #event$: ReplaySubject<ModuleEvent> = new ReplaySubject<ModuleEvent>(100);

  /**
   * Stream of lifecycle events emitted while modules are configured, initialized,
   * and disposed.
   *
   * @returns An observable of {@link ModuleEvent} entries.
   */
  public get event$(): IModulesConfigurator<TModules, TRef>['event$'] {
    return this.#event$.asObservable();
  }

  /**
   * Registered configure-phase callbacks.
   * Each entry is added by {@link addConfig} when a `configure` callback is provided.
   * @protected
   */
  protected _configs: Array<QualifiedConfigCallback<TRef>> = [];

  /**
   * Registered post-configure callbacks.
   * Populated by {@link onConfigured} and by `afterConfig` entries in {@link addConfig}.
   * Also exposed on the config object as `config.onAfterConfiguration` so modules
   * can register additional hooks during their own configure factory.
   *
   * Typed as `any` because this is an internal dispatch array: callbacks are registered
   * with concrete module-specific types but stored erased — the orchestrator never
   * inspects the config shape itself, it only forwards it at call time.
   * @protected
   */
  protected _afterConfiguration: Array<QualifiedPostConfigCallback> = [];

  /**
   * Registered post-initialize callbacks.
   * Populated by {@link onInitialized} and by `afterInit` entries in {@link addConfig}.
   * Also exposed on the config object as `config.onAfterInit`.
   *
   * Typed as `any` for the same reason as {@link _afterConfiguration} — type-erased
   * internal dispatch; concrete instance types are known at registration but not stored.
   * @protected
   */
  protected _afterInit: Array<QualifiedPostInitCallback> = [];

  /**
   * Registered plugin callbacks.
   *
   * Plugins run after all modules have initialized and before initialize resolves.
   * Typed as `any` because callbacks are registered with concrete module maps but
   * stored erased by the base orchestrator.
   * @protected
   */
  protected _plugins: Array<FrameworkPluginCallback<any, TRef>> = [];

  /**
   * Teardown callbacks returned by registered plugins.
   *
   * Consumed during dispose and cleared after execution so repeated dispose calls
   * do not run plugin cleanup more than once.
   * @protected
   */
  protected _pluginTeardowns: FrameworkPluginTeardown[] = [];

  /**
   * Set of all registered module descriptors.
   * Uses a `Set` for automatic deduplication — the same module registered twice
   * is treated as a single registration.
   * @protected
   */
  protected _modules: Set<AnyModule>;

  /**
   * Creates a new `ModulesConfigurator` with an optional initial set of modules.
   *
   * @param modules - Optional array of module descriptors to pre-register.
   */
  constructor(modules?: Array<AnyModule>) {
    this._modules = new Set(modules ? this._dedupeModulesByName(modules) : []);
  }

  /**
   * Keeps the last registration for each module name.
   *
   * @param modules - Module descriptors to deduplicate.
   * @returns The deduplicated module descriptors.
   */
  private _dedupeModulesByName(modules: Array<AnyModule>): Array<AnyModule> {
    const lastByName = new Map<string, AnyModule>();
    // Iterate in registration order so later descriptors intentionally override earlier ones.
    for (const module of modules) {
      lastByName.set(module.name, module);
    }
    return Array.from(lastByName.values());
  }

  /**
   * Removes lifecycle callbacks belonging to a replaced module.
   *
   * @param moduleName - Name of the module whose callbacks are removed.
   */
  private _removeModuleCallbacks(moduleName: string): void {
    // Remove callbacks from each lifecycle phase so replaced modules cannot run stale behavior.
    this._configs = this._configs.filter((callback) => callback.moduleName !== moduleName);
    // Keep cleanup callbacks aligned with the module replacement.
    this._afterConfiguration = this._afterConfiguration.filter(
      (callback) => callback.moduleName !== moduleName,
    );
    // Remove initialization callbacks as well, preventing the old module from being initialized.
    this._afterInit = this._afterInit.filter((callback) => callback.moduleName !== moduleName);
  }

  /**
   * Returns all registered module descriptors as an ordered array.
   *
   * @returns Array of registered modules in insertion order.
   */
  get modules(): Array<AnyModule> {
    return [...this._modules];
  }

  /**
   * Registers one or more module configurators.
   *
   * Convenience wrapper around {@link addConfig} for registering multiple
   * modules in a single call.
   *
   * @param configs - One or more module configurator descriptors.
   */
  public configure(...configs: Array<IModuleConfigurator<AnyModule, TRef>>): void {
    // Delegate each descriptor to addConfig so registration logic stays in one place
    for (const x of configs) {
      this.addConfig(x);
    }
  }

  /**
   * Registers a single module configurator.
   *
   * If a module with the same `name` was already registered, the previous
   * registration is replaced so the last added module wins.
   *
   * Adds the module to the known module set and registers the optional
   * `configure`, `afterConfig`, and `afterInit` callbacks into their
   * respective lifecycle phase arrays.
   *
   * @param config - The module configurator descriptor to register.
   * @template T - The module type being registered.
   * @template TConfig - The resolved configuration type for the module.
   */
  public addConfig<T extends AnyModule, TConfig = ModuleConfigType<T>>(
    config: IModuleConfigurator<T, TRef, TConfig>,
  ): void {
    const { module, afterConfig, afterInit, configure } = config;
    // Find an existing descriptor so re-registering a name can replace all of its lifecycle hooks.
    const existingModule = Array.from(this._modules).find((m) => m.name === module.name);

    // Re-registration must remove old callbacks before installing the replacement.
    if (existingModule) {
      this._removeModuleCallbacks(module.name);
      // Replace the descriptor only when the caller supplied a different object.
      if (existingModule !== module) {
        const modules = Array.from(this._modules)
          // Preserve every descriptor while substituting the newly registered module.
          .map((m) => (m.name === module.name ? module : m));
        this._modules = new Set(modules);
      }
    } else {
      this._modules.add(module);
    }

    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.ModuleConfigAdded,
      message: `Module configurator added for ${module.name}`,
      properties: {
        moduleName: module.name,
        moduleVersion: module.version?.toString() || 'unknown',
        configure: !!configure,
        afterConfig: !!afterConfig,
        afterInit: !!afterInit,
      },
    });
    // Register each optional callback into its corresponding lifecycle phase array.
    // When the same module name is re-registered, previous callbacks are removed
    // so the latest configuration wins.
    if (configure) {
      const callback = ((cfg, ref) =>
        configure(cfg[module.name], ref)) as QualifiedConfigCallback<TRef>;
      callback.moduleName = module.name;
      this._configs.push(callback);
    }

    // Register the afterConfig callback, if provided.
    if (afterConfig) {
      const callback = ((cfg) => afterConfig(cfg[module.name])) as QualifiedPostConfigCallback;
      callback.moduleName = module.name;
      this._afterConfiguration.push(callback);
    }

    // Register the afterInit callback, if provided.
    if (afterInit) {
      const callback = ((instances) =>
        afterInit(instances[module.name])) as QualifiedPostInitCallback;
      callback.moduleName = module.name;
      this._afterInit.push(callback);
    }
  }

  /**
   * Registers a callback for the post-configure phase.
   *
   * The callback receives the merged module config map after all `configure`
   * callbacks have run and before module initialization begins.
   *
   * @param cb - Callback receiving the merged module config map.
   * @template T - Additional modules to include in the config type.
   */
  public onConfigured<T>(
    cb: (config: ModulesConfigType<CombinedModules<T, TModules>>) => void | Promise<void>,
  ): void {
    this._afterConfiguration.push(cb);
    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.OnConfiguredAdded,
      message: 'Added onConfigured callback',
      properties: {
        count: this._afterConfiguration.length,
        name: cb.name || 'anonymous',
      },
    });
  }

  /**
   * Registers a callback for the post-initialize phase.
   *
   * The callback receives the sealed module instance after all modules have
   * been initialized and their `postInitialize` hooks have run.
   *
   * @param cb - Callback receiving the sealed module instance.
   * @template T - Additional modules to include in the instance type.
   */
  public onInitialized<T>(
    cb: (instance: ModulesInstanceType<CombinedModules<T, TModules>>) => void | Promise<void>,
  ): void {
    this._afterInit.push(cb);
    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.OnInitializedAdded,
      message: 'Added onInitialized callback',
      properties: {
        count: this._afterInit.length,
        name: cb.name || 'anonymous',
      },
    });
  }

  /**
   * Registers a plugin that connects side effects after modules are initialized.
   *
   * The callback runs after `postInitialize` and `onInitialized` callbacks have
   * settled, but before {@link initialize} resolves. Return a teardown callback
   * to clean up subscriptions or listeners during {@link dispose}.
   *
   * @param cb - Plugin callback receiving the initialized module map and optional ref.
   * @template T - Additional modules to include in the plugin module map.
   * @example
   * ```typescript
   * function connectContextTelemetry(args: FrameworkPluginArgs<[EventModule, TelemetryModule]>) {
   *   const teardown = args.modules.event.addEventListener('context:changed', (event) => {
   *     args.modules.telemetry.track('context.changed', event.detail);
   *   });
   *
   *   return teardown;
   * }
   *
   * configurator.registerPlugin(connectContextTelemetry);
   * ```
   */
  public registerPlugin<T extends Array<AnyModule> | unknown>(
    cb: FrameworkPluginCallback<CombinedModules<T, TModules>, TRef>,
  ): void {
    this._plugins.push(cb as FrameworkPluginCallback<any, TRef>);
    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.PluginAdded,
      message: 'Added plugin callback',
      properties: {
        count: this._plugins.length,
        name: cb.name || 'anonymous',
      },
    });
  }

  /**
   * Runs the full configure → initialize pipeline and returns a sealed module instance.
   *
   * Execution order:
   * 1. {@link _configure} — configure phase (creates config, applies callbacks, post-configure hooks).
   * 2. {@link _initialize} — initialize phase (concurrent module init with `requireInstance`).
   * 3. {@link _postInitialize} — post-initialize phase (`postInitialize` hooks + `onInitialized` callbacks).
   * 4. {@link _registerPlugins} — plugin phase (`registerPlugin` callbacks connect side effects).
   *
   * @param ref - Optional reference forwarded to all module lifecycle hooks.
   * @returns A promise resolving to the sealed, initialized module instance.
   * @template T - Additional modules to merge into the instance type.
   * @template R - The reference type, narrowed to `TRef`.
   */
  public async initialize<T, R extends TRef = TRef>(
    ref?: R,
  ): Promise<ModulesInstance<CombinedModules<T, TModules>>> {
    const configStart = performance.now();
    const config = await this._configure<T, R>(ref);
    const configLoadTime = Math.round(performance.now() - configStart);

    // Build a comma-separated module name list for telemetry properties
    // Extract just the module names before joining into a display string
    const configModuleNames = this.modules.map((m) => m.name).join(', ');
    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.InitializeConfigLoaded,
      message: `Modules configured in ${configLoadTime}ms`,
      properties: {
        modules: configModuleNames,
        count: this.modules.length,
        loadTime: configLoadTime,
      },
      metric: configLoadTime,
    });

    const instanceStart = performance.now();
    const instance = await this._initialize<T, R>(config, ref);
    const instanceLoadTime = Math.round(performance.now() - instanceStart);

    // Build a comma-separated module name list for telemetry properties
    // Extract just the module names before joining into a display string
    const instanceModuleNames = this.modules.map((m) => m.name).join(', ');
    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.InitializeInstanceInitialized,
      message: `Modules initialized in ${instanceLoadTime}ms`,
      properties: {
        modules: instanceModuleNames,
        count: this.modules.length,
        loadTime: instanceLoadTime,
      },
      metric: instanceLoadTime,
    });

    const totalLoadTime = configLoadTime + instanceLoadTime;
    // Build a comma-separated module name list for telemetry properties
    // Extract just the module names before joining into a display string
    const totalModuleNames = this.modules.map((m) => m.name).join(', ');
    this._registerEvent({
      level: ModuleEventLevel.Information,
      name: ModuleConfiguratorEventName.Initialize,
      message: `initialize in ${totalLoadTime}ms`,
      properties: {
        modules: totalModuleNames,
        configLoadTime,
        instanceLoadTime,
        totalLoadTime,
      },
      metric: totalLoadTime,
    });

    await this._postInitialize<T, R>(instance, ref);

    // `instance` is the freshly built module instance record, which is structurally compatible
    // with `ModulesInstance<TModules>` but not nominally assignable across the generic params.
    const modules = Object.seal(
      Object.assign({}, instance, {
        dispose: () => this.dispose(instance as unknown as ModulesInstance<TModules>),
      }),
    );
    await this._registerPlugins<T, R>(modules, ref);

    return modules;
  }

  /**
   * Namespaces and emits a lifecycle event into the internal event stream.
   *
   * The event name is prefixed with the configurator class name (e.g.
   * `"ModulesConfigurator::ModuleConfigurator.module.configAdded"`) to prevent
   * name collisions between nested configurators.
   *
   * @param event - The lifecycle event to emit.
   * @protected
   */
  protected _registerEvent(event: ModuleEvent): void {
    // Split on '::' to avoid double-prefixing already-namespaced event names
    const nameParts = event.name.split('::');
    this.#event$.next({
      ...event,
      name: `${(this.constructor as typeof ModulesConfigurator).className}::${nameParts[nameParts.length - 1]}`,
    });
  }

  /**
   * Runs the configure lifecycle phase.
   *
   * Delegates to {@link runConfigurePhase} which creates module config builders,
   * applies registered callbacks, and runs post-configure hooks.
   *
   * Override this method in a subclass to customize the configure phase.
   *
   * @param ref - Optional reference forwarded to module configure factories.
   * @returns A promise resolving to the merged module config map.
   * @template T - Additional modules to merge into the instance type.
   * @template R - The reference type, narrowed to `TRef`.
   * @protected
   */
  protected async _configure<T, R extends TRef = TRef>(
    ref?: R,
  ): Promise<ModulesConfig<CombinedModules<T, TModules>>> {
    return runConfigurePhase(
      {
        modules: this.modules,
        configs: this._configs,
        afterConfiguration: this._afterConfiguration,
        afterInit: this._afterInit,
        registerEvent: this._registerEvent.bind(this),
      },
      ref,
    ) as Promise<ModulesConfig<CombinedModules<T, TModules>>>;
  }

  /**
   * Runs the initialize lifecycle phase.
   *
   * Delegates to {@link runInitializePhase} which initializes all modules
   * concurrently and resolves cross-module dependencies through `requireInstance`.
   *
   * Override this method in a subclass to customize the initialize phase.
   *
   * @param config - The merged module config map from the configure phase.
   * @param ref - Optional reference forwarded to each module's `initialize` call.
   * @returns A promise resolving to the sealed map of initialized module providers.
   * @template T - Additional modules to merge into the instance type.
   * @template R - The reference type. Defaults to `TRef`.
   * @protected
   */
  protected async _initialize<T, R = TRef>(
    config: ModulesConfigType<CombinedModules<T, TModules>>,
    ref?: R,
  ): Promise<ModulesInstanceType<CombinedModules<T, TModules>>> {
    return runInitializePhase(
      {
        modules: this.modules,
        registerEvent: this._registerEvent.bind(this),
      },
      config,
      ref,
    );
  }

  /**
   * Runs the post-initialize lifecycle phase.
   *
   * Delegates to {@link runPostInitializePhase} which calls each module's
   * `postInitialize` hook and then runs all `onInitialized` callbacks.
   *
   * Override this method in a subclass to customize the post-initialize phase.
   *
   * @param instance - The sealed module instance from the initialize phase.
   * @param ref - Optional reference forwarded to each module's `postInitialize` call.
   * @template T - Additional modules to merge into the instance type.
   * @template R - The reference type. Defaults to `TRef`.
   * @protected
   */
  protected async _postInitialize<T, R = TRef>(
    instance: ModulesInstanceType<CombinedModules<T, TModules>>,
    ref?: R,
  ): Promise<void> {
    return runPostInitializePhase(
      {
        modules: this.modules,
        afterInit: this._afterInit,
        registerEvent: this._registerEvent.bind(this),
      },
      instance,
      ref,
    );
  }

  /**
   * Runs the plugin lifecycle phase.
   *
   * Delegates to {@link runPluginPhase} which calls each registered plugin and
   * stores returned teardown callbacks for dispose.
   *
   * Override this method in a subclass to customize plugin registration.
   *
   * @param instance - The sealed module instance from the initialize phase.
   * @param ref - Optional reference forwarded to each plugin callback.
   * @template T - Additional modules to merge into the instance type.
   * @template R - The reference type, narrowed to `TRef`.
   * @protected
   */
  protected async _registerPlugins<T, R extends TRef = TRef>(
    instance: ModulesInstanceType<CombinedModules<T, TModules>>,
    ref?: R,
  ): Promise<void> {
    return runPluginPhase(
      {
        plugins: this._plugins,
        teardowns: this._pluginTeardowns,
        registerEvent: this._registerEvent.bind(this),
      },
      instance,
      ref,
    );
  }

  /**
   * Tears down all modules managed by this configurator.
   *
   * Delegates to {@link runDisposePhase} which calls each module's `dispose`
   * hook and then completes the internal event stream.
   *
   * @param instance - The initialized module instance to tear down.
   * @param ref - Optional reference forwarded to module dispose hooks.
   * @returns A promise resolving when all modules have been disposed.
   */
  public async dispose(instance: ModulesInstanceType<TModules>, ref?: TRef): Promise<void> {
    return runDisposePhase(
      {
        modules: this.modules,
        registerEvent: this._registerEvent.bind(this),
        // ReplaySubject extends Subject — dispose only needs .complete() which both have.
        event$: this.#event$,
        pluginTeardowns: this._pluginTeardowns,
      },
      instance,
      ref,
    );
  }
}
