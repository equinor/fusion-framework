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

import { runConfigurePhase } from './phases/configure.js';
import { runInitializePhase } from './phases/initialize.js';
import { runPostInitializePhase } from './phases/post-initialize.js';
import { runDisposePhase } from './phases/dispose.js';
import { version } from '../../version.js';

/**
 * Core orchestrator that drives the module lifecycle in Fusion Framework.
 *
 * `ModulesConfigurator` manages the full **configure → initialize → dispose**
 * pipeline for a set of modules. Consumers register modules via {@link addConfig}
 * or {@link configure}, then call {@link initialize} to produce a sealed
 * {@link ModulesInstance} whose properties are the initialized module providers.
 *
 * ### Lifecycle phases (in execution order)
 *
 * | # | Phase | Entry point | Description |
 * |---|-------|-------------|-------------|
 * | 1 | **Configure** | `_configure` | Each module's `configure()` factory creates a config builder; registered callbacks mutate it. |
 * | 2 | **Post-configure** | `_postConfigure` (inside `_configure`) | `postConfigure()` hooks and `onConfigured` callbacks run. |
 * | 3 | **Initialize** | `_initialize` | Modules are initialized concurrently; cross-module dependencies are resolved through `requireInstance`. |
 * | 4 | **Post-initialize** | `_postInitialize` | `postInitialize()` hooks and `onInitialized` callbacks run. |
 * | 5 | **Dispose** | `dispose` | Each module's `dispose()` hook runs; the event stream is completed. |
 *
 * ### Registering phase callbacks
 *
 * - **Per-module callbacks**: use `addConfig({ module, configure, afterConfig, afterInit })`.
 * - **Global post-configure**: use `onConfigured(cb)`.
 * - **Global post-initialize**: use `onInitialized(cb)`.
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

  get version(): string {
    return version;
  }

  // Buffer up to 100 events to prevent memory leaks while ensuring telemetry
  // can capture events that fire before a telemetry subscriber attaches.
  // mapConfiguratorEvents relies on replay to receive events emitted during
  // configuration before telemetry is wired up.
  // Memory bound: ~24 KB at ~240 bytes/event × 100 events.
  #event$: ReplaySubject<ModuleEvent> = new ReplaySubject<ModuleEvent>(100);

  public get event$(): IModulesConfigurator<TModules, TRef>['event$'] {
    return this.#event$.asObservable();
  }

  /**
   * Registered configure-phase callbacks.
   * Each entry is added by {@link addConfig} when a `configure` callback is provided.
   * @protected
   */
  protected _configs: Array<ModulesConfiguratorConfigCallback<TRef>> = [];

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
  protected _afterConfiguration: Array<(config: any) => void | Promise<void>> = [];

  /**
   * Registered post-initialize callbacks.
   * Populated by {@link onInitialized} and by `afterInit` entries in {@link addConfig}.
   * Also exposed on the config object as `config.onAfterInit`.
   *
   * Typed as `any` for the same reason as {@link _afterConfiguration} — type-erased
   * internal dispatch; concrete instance types are known at registration but not stored.
   * @protected
   */
  protected _afterInit: Array<(instance: any) => void> = [];

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
    this._modules = new Set(modules);
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
    for (const x of configs) {
      this.addConfig(x);
    }
  }

  /**
   * Registers a single module configurator.
   *
   * Adds the module to the known module set and registers the optional
   * `configure`, `afterConfig`, and `afterInit` callbacks into their
   * respective lifecycle phase arrays.
   *
   * @param config - The module configurator descriptor to register.
   * @template T - The module type being registered.
   */
  public addConfig<T extends AnyModule, TConfig = ModuleConfigType<T>>(
    config: IModuleConfigurator<T, TRef, TConfig>,
  ): void {
    const { module, afterConfig, afterInit, configure } = config;
    this._modules.add(module);
    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: 'moduleConfigAdded',
      message: `Module configurator added for ${module.name}`,
      properties: {
        moduleName: module.name,
        moduleVersion: module.version?.toString() || 'unknown',
        configure: !!configure,
        afterConfig: !!afterConfig,
        afterInit: !!afterInit,
      },
    });
    // Register each optional callback into its corresponding lifecycle phase array
    if (configure) this._configs.push((cfg, ref) => configure(cfg[module.name], ref));
    if (afterConfig) this._afterConfiguration.push((cfg) => afterConfig(cfg[module.name]));
    if (afterInit) this._afterInit.push((instances) => afterInit(instances[module.name]));
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
      name: 'addOnConfigured',
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
    cb: (instance: ModulesInstanceType<CombinedModules<T, TModules>>) => void,
  ): void {
    this._afterInit.push(cb);
    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: 'addOnInitialized',
      message: 'Added onInitialized callback',
      properties: {
        count: this._afterInit.length,
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
   *
   * @param ref - Optional reference forwarded to all module lifecycle hooks.
   * @returns A promise resolving to the sealed, initialized module instance.
   * @template T - Additional modules to merge into the instance type.
   */
  public async initialize<T, R extends TRef = TRef>(
    ref?: R,
  ): Promise<ModulesInstance<CombinedModules<T, TModules>>> {
    const configStart = performance.now();
    const config = await this._configure<T, R>(ref);
    const configLoadTime = Math.round(performance.now() - configStart);

    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: 'initialize.configLoaded',
      message: `Modules configured in ${configLoadTime}ms`,
      properties: {
        modules: this.modules.map((m) => m.name).join(', '),
        count: this.modules.length,
        loadTime: configLoadTime,
      },
      metric: configLoadTime,
    });

    const instanceStart = performance.now();
    const instance = await this._initialize<T, R>(config, ref);
    const instanceLoadTime = Math.round(performance.now() - instanceStart);

    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: 'initialize.instanceInitialized',
      message: `Modules initialized in ${instanceLoadTime}ms`,
      properties: {
        modules: this.modules.map((m) => m.name).join(', '),
        count: this.modules.length,
        loadTime: instanceLoadTime,
      },
      metric: instanceLoadTime,
    });

    const totalLoadTime = configLoadTime + instanceLoadTime;
    this._registerEvent({
      level: ModuleEventLevel.Information,
      name: 'initialize',
      message: `initialize in ${totalLoadTime}ms`,
      properties: {
        modules: this.modules.map((m) => m.name).join(', '),
        configLoadTime,
        instanceLoadTime,
        totalLoadTime,
      },
      metric: totalLoadTime,
    });

    await this._postInitialize<T, R>(instance, ref);

    return Object.seal(
      Object.assign({}, instance, {
        dispose: () => this.dispose(instance as unknown as ModulesInstance<TModules>),
      }),
    );
  }

  /**
   * Namespaces and emits a lifecycle event into the internal event stream.
   *
   * The event name is prefixed with the configurator class name (e.g.
   * `"ModulesConfigurator::moduleConfigAdded"`) to prevent name collisions
   * between nested configurators.
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
      },
      instance,
      ref,
    );
  }
}
