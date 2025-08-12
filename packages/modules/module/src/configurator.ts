/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BehaviorSubject,
  EMPTY,
  firstValueFrom,
  from,
  lastValueFrom,
  ReplaySubject,
  throwError,
  type Observable,
} from 'rxjs';
import {
  catchError,
  defaultIfEmpty,
  filter,
  map,
  mergeMap,
  reduce,
  tap,
  timeout,
} from 'rxjs/operators';

import {
  ModuleEventLevel,
  type AnyModule,
  type CombinedModules,
  type ModuleConfigType,
  type ModuleEvent,
  type ModuleInstance,
  type ModulesConfig,
  type ModulesConfigType,
  type ModulesInstance,
  type ModulesInstanceType,
  type ModuleType,
} from './types';

import { BaseModuleProvider, type IModuleProvider } from './lib/provider';

import { version } from './version';

/**
 * Represents a configurator for modules.
 *
 * @template TModules - The array of modules.
 * @template TRef - The reference type.
 */
export interface IModulesConfigurator<
  TModules extends Array<AnyModule> = Array<AnyModule>,
  TRef = any,
> {
  readonly version: string;
  readonly event$: Observable<ModuleEvent>;

  /**
   * Configures the modules using the provided module configurators.
   *
   * @param configs - The array of module configurators.
   */
  configure(...configs: Array<IModuleConfigurator<any, TRef>>): void;

  /**
   * Adds a module configurator to the list of configurators.
   *
   * @param config - The module configurator to add.
   */
  addConfig<T extends AnyModule>(config: IModuleConfigurator<T, TRef>): void;

  /**
   * Initializes the modules with the specified reference.
   *
   * @param ref - The reference object.
   * @returns A promise that resolves to the initialized modules instance.
   */
  initialize<T extends Array<AnyModule> | unknown>(
    ref?: TRef,
  ): Promise<ModulesInstance<CombinedModules<T, TModules>>>;

  /**
   * Registers a callback function to be called when the modules are configured.
   *
   * @param cb - The callback function.
   */
  onConfigured<T>(
    cb: (config: ModulesConfigType<CombinedModules<T, TModules>>) => void | Promise<void>,
  ): void;

  /**
   * Registers a callback function to be called when the modules are initialized.
   *
   * @param cb - The callback function.
   */
  onInitialized<T extends Array<AnyModule> | unknown>(
    cb: (instance: ModulesInstanceType<CombinedModules<T, TModules>>) => void,
  ): void;

  /**
   * Disposes the modules instance with the specified reference.
   *
   * @param instance - The modules instance to dispose.
   * @param ref - The reference object.
   * @returns A promise that resolves when the disposal is complete.
   */
  dispose(instance: ModulesInstanceType<TModules>, ref?: TRef): Promise<void>;
}

export interface IModuleConfigurator<TModule extends AnyModule = AnyModule, TRef = ModuleInstance> {
  module: TModule;
  configure?: (config: ModuleConfigType<TModule>, ref?: TRef) => void | Promise<void>;
  afterConfig?: (config: ModuleConfigType<TModule>) => void;
  afterInit?: (instance: ModuleType<TModule>) => void | Promise<void>;
}

/**
 * Error thrown when a required module times out.
 */
class RequiredModuleTimeoutError extends Error {
  constructor() {
    super('It was too slow');
    this.name = 'RequiredModuleTimeoutError';
  }
}

/**
 * A callback type used to configure a module's configuration.
 *
 * @template TModule - The type of the module being configured. Must extend `AnyModule`.
 * @template TRef - An optional reference type that can be used during configuration. Defaults to `unknown`.
 *
 * @param config - The configuration object for the specified module type.
 * @param ref - An optional reference object that can be used to assist in the configuration process.
 * @returns A `void` or a `Promise<void>` indicating that the configuration process may be asynchronous.
 */
export type ModuleConfiguratorConfigCallback<TModule extends AnyModule, TRef = unknown> = (
  config: ModuleConfigType<TModule>,
  ref?: TRef,
) => void | Promise<void>;

/**
 * Callback function type for configuring modules.
 * @template TRef The reference type.
 * @param config The modules configuration.
 * @param ref Optional reference parameter.
 */
export type ModulesConfiguratorConfigCallback<TRef> = (
  config: ModulesConfig<[AnyModule]>,
  ref?: TRef,
) => void | Promise<void>;

/**
 * Configurator class for modules.
 * @template TModules - Array of modules.
 * @template TRef - Reference type.
 */
export class ModulesConfigurator<TModules extends Array<AnyModule> = Array<AnyModule>, TRef = any>
  implements IModulesConfigurator<TModules, TRef>
{
  get version(): string {
    return version;
  }

  #event$: ReplaySubject<ModuleEvent> = new ReplaySubject<ModuleEvent>();
  public get event$(): IModulesConfigurator<TModules, TRef>['event$'] {
    return this.#event$.asObservable();
  }

  /**
   * Logger instance for the configurator.
   */
  // public logger: ModuleConsoleLogger = new ModuleConsoleLogger('ModulesConfigurator');

  /**
   * Array of configuration callbacks.
   * @protected
   * @sealed
   */
  protected _configs: Array<ModulesConfiguratorConfigCallback<TRef>> = [];

  /**
   * Array of callbacks to be executed after configuration.
   */
  protected _afterConfiguration: Array<(config: any) => void> = [];

  /**
   * Array of callbacks to be executed after initialization.
   */
  protected _afterInit: Array<(instance: any) => void> = [];

  /**
   * Set of modules.
   */
  protected _modules: Set<AnyModule>;

  /**
   * Constructs a new ModulesConfigurator instance.
   * @param modules - Array of modules.
   */
  constructor(modules?: Array<AnyModule>) {
    this._modules = new Set(modules);
  }

  /**
   * Gets the array of modules.
   * @returns Array of modules.
   */
  get modules(): Array<AnyModule> {
    return [...this._modules];
  }

  /**
   * Configures the modules with the provided configurators.
   * @param configs - Array of module configurators.
   */
  public configure(...configs: Array<IModuleConfigurator<any, TRef>>) {
    for (const x of configs) {
      this.addConfig(x);
    }
  }

  /**
   * Adds a module configurator.
   * @param config - Module configurator.
   */
  public addConfig<T extends AnyModule>(config: IModuleConfigurator<T, TRef>) {
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
    configure && this._configs.push((config, ref) => configure(config[module.name], ref));
    afterConfig && this._afterConfiguration.push((config) => afterConfig(config[module.name]));
    afterInit && this._afterInit.push((instances) => afterInit(instances[module.name]));
  }

  /**
   * Registers a callback to be executed after configuration.
   * @param cb - Callback function.
   */
  public onConfigured<T>(
    cb: (config: ModulesConfigType<CombinedModules<T, TModules>>) => void | Promise<void>,
  ) {
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
   * Registers a callback to be executed after initialization.
   * @param cb - Callback function.
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
   * Initializes the modules with the provided reference.
   * @param ref - Reference object.
   * @returns Promise that resolves to the initialized module instance.
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

  protected _registerEvent(event: ModuleEvent): void {
    this.#event$.next(event);
  }

  /**
   * Configures the modules with the provided reference.
   * @param ref - Reference object.
   * @returns Promise that resolves to the module configuration.
   */
  protected async _configure<T, R extends TRef = TRef>(
    ref?: R,
  ): Promise<ModulesConfig<CombinedModules<T, TModules>>> {
    const config = await this._createConfig<T, R>(ref);
    await Promise.all(this._configs.map((x) => Promise.resolve(x(config, ref))));
    await this._postConfigure<T>(config);
    return config;
  }

  /**
   * Creates the module configuration with the provided reference.
   * @param ref - Reference object.
   * @returns Promise that resolves to the module configuration.
   */
  protected _createConfig<T, R = TRef>(
    ref?: R,
  ): Promise<ModulesConfig<CombinedModules<T, TModules>>> {
    const { modules, _afterConfiguration, _afterInit } = this;
    const config$ = from(modules).pipe(
      // TODO - handle config creation errors
      mergeMap(async (module) => {
        const configStart = performance.now();
        try {
          const configurator = await module.configure?.(ref);
          const configLoadTime = Math.round(performance.now() - configStart);
          this._registerEvent({
            level: ModuleEventLevel.Debug,
            name: '_createConfig.configuratorCreated',
            message: `Configurator created for ${module.name} in ${configLoadTime}ms`,
            properties: {
              moduleName: module.name,
              moduleVersion: module.version?.toString() || 'unknown',
              configLoadTime,
            },
            metric: configLoadTime,
          });
          return { [module.name]: configurator };
        } catch (err) {
          this._registerEvent({
            level: ModuleEventLevel.Error,
            name: '_createConfig.configuratorFailed',
            message: `Failed to create configurator for ${module.name}`,
            properties: {
              moduleName: module.name,
              moduleVersion: module.version?.toString() || 'unknown',
            },
            metric: Math.round(performance.now() - configStart),
            error: err,
          });
          throw err;
        }
      }),
      reduce((acc, module) => Object.assign(acc, module), {
        onAfterConfiguration(cb) {
          _afterConfiguration.push(cb);
        },
        onAfterInit(cb) {
          _afterInit.push(cb);
        },
      } as ModulesConfig<CombinedModules<T, TModules>>),
    );

    return lastValueFrom(config$);
  }

  /**
   * Executes post-configuration tasks.
   * @param config - Module configuration.
   * @returns Promise that resolves when post-configuration tasks are complete.
   */
  protected async _postConfigure<T>(
    config: ModulesConfigType<CombinedModules<T, TModules>>,
  ): Promise<void> {
    const { modules, _afterConfiguration: afterConfiguration } = this;
    await Promise.allSettled(
      modules
        .filter((module) => !!module.postConfigure)
        .map(async (module) => {
          try {
            const postConfigStart = performance.now();
            await module.postConfigure?.(config);
            this._registerEvent({
              level: ModuleEventLevel.Debug,
              name: '_postConfigure.modulePostConfigured',
              message: `Module ${module.name} post-configured successfully`,
              properties: {
                moduleName: module.name,
                moduleVersion: module.version?.toString() || 'unknown',
                postConfigTime: Math.round(performance.now() - postConfigStart),
              },
            });
          } catch (err) {
            this._registerEvent({
              level: ModuleEventLevel.Warning,
              name: '_postConfigure.modulePostConfigureError',
              message: `Module ${module.name} post-configure failed`,
              properties: {
                moduleName: module.name,
                moduleVersion: module.version?.toString() || 'unknown',
              },
              error: err,
            });
          }
        }),
    );

    /** call all added post config hooks  */
    if (afterConfiguration.length) {
      try {
        this._registerEvent({
          level: ModuleEventLevel.Debug,
          name: '_postConfigure.hooks',
          message: `Post configure hooks [${afterConfiguration.length}] called`,
        });
        const postConfigHooksStart = performance.now();
        await Promise.allSettled(afterConfiguration.map((x) => Promise.resolve(x(config))));
        const postConfigHooksTime = Math.round(performance.now() - postConfigHooksStart);
        this._registerEvent({
          level: ModuleEventLevel.Debug,
          name: '_postConfigure.hooksComplete',
          message: 'Post configure hooks complete',
          properties: {
            count: afterConfiguration.length,
            postConfigHooksTime,
          },
          metric: postConfigHooksTime,
        });
      } catch (err) {
        this._registerEvent({
          level: ModuleEventLevel.Warning,
          name: '_postConfigure.hooksError',
          message: 'Post configure hook failed',
          error: err,
        });
      }
    }
  }

  /**
   * Initializes the modules with the provided configuration and reference.
   * @param config - Module configuration.
   * @param ref - Reference object.
   * @returns Promise that resolves to the initialized module instance.
   */
  protected async _initialize<T, R = TRef>(
    config: ModulesConfigType<CombinedModules<T, TModules>>,
    ref?: R,
  ): Promise<ModulesInstanceType<CombinedModules<T, TModules>>> {
    const moduleNames = this.modules.map((m) => m.name);

    const instance$ = new BehaviorSubject<ModulesInstanceType<CombinedModules<T, TModules>>>(
      {} as ModulesInstanceType<CombinedModules<T, TModules>>,
    );

    /** Method to check if a module is defined */
    const hasModule = (name: string) => moduleNames.includes(name);

    /**
     * Requires and returns an initialized module instance by its name.
     *
     * If the requested module is already initialized, returns it immediately as a resolved Promise.
     * If the module is not yet initialized, waits for its initialization and resolves with the instance,
     * or rejects with a timeout error if the module is not initialized within the specified time.
     *
     * Throws an error immediately if the requested module name is not defined in the current configuration.
     * Also logs relevant events for debugging and error tracking.
     *
     * @template TKey - The key of the module to require, constrained to the keys of the combined modules instance type.
     * @param name - The name of the module to require.
     * @param wait - The maximum time to wait (in seconds) for the module to initialize before timing out. Defaults to 60 seconds.
     * @returns A Promise that resolves with the initialized module instance of type `ModulesInstanceType<CombinedModules<T, TModules>>[TKey]`.
     * @throws {Error} If the module name is not defined.
     * @throws {RequiredModuleTimeoutError} If the module does not initialize within the specified timeout.
     *
     * @example
     * ```typescript
     * const myModule = await requireInstance('myModuleName', 30);
     * ```
     */
    const requireInstance = <TKey extends keyof ModulesInstanceType<CombinedModules<T, TModules>>>(
      name: TKey,
      wait = 60,
    ): Promise<ModulesInstanceType<CombinedModules<T, TModules>>[TKey]> => {
      /** if module name is not defined, throw error */
      if (!moduleNames.includes(name)) {
        const error = new Error(`Cannot require [${String(name)}] since module is not defined!`);
        error.name = 'ModuleNotDefinedError';
        this._registerEvent({
          level: ModuleEventLevel.Error,
          name: '_initialize.requireInstance.moduleNotDefined',
          message: error.message,
          properties: {
            moduleName: String(name),
            wait,
          },
          error,
        });
        throw error;
      }

      /** if module is already initialized, return it */
      if (instance$.value[name]) {
        this._registerEvent({
          level: ModuleEventLevel.Debug,
          name: '_initialize.requireInstance.moduleAlreadyInitialized',
          message: `Module [${String(name)}] is already initialized, skipping queue`,
          properties: {
            moduleName: String(name),
            wait,
          },
        });
        return Promise.resolve(instance$.value[name]);
      }

      const requireStart = performance.now();
      this._registerEvent({
        level: ModuleEventLevel.Debug,
        name: '_initialize.requireInstance.awaiting',
        message: `Awaiting module [${String(name)}] initialization, timeout ${wait}s`,
        properties: {
          moduleName: String(name),
          wait,
        },
      });

      return firstValueFrom(
        instance$.pipe(
          filter((x) => !!x[name]),
          map((x) => x[name]),
          timeout({
            each: wait * 1000,
            with: () =>
              throwError(() => {
                const error = new RequiredModuleTimeoutError();
                this._registerEvent({
                  level: ModuleEventLevel.Error,
                  name: '_initialize.requireInstance.timeout',
                  message: `Module [${String(name)}] initialization timed out after ${wait}s`,
                  properties: {
                    moduleName: String(name),
                    wait,
                  },
                  error,
                });
                return error;
              }),
          }),
          tap(() => {
            const requireTime = Math.round(performance.now() - requireStart);
            this._registerEvent({
              level: ModuleEventLevel.Debug,
              name: '_initialize.requireInstance.moduleResolved',
              message: `Module [${String(name)}] required in ${requireTime}ms`,
              properties: {
                moduleName: String(name),
                wait,
                requireTime,
              },
              metric: requireTime,
            });
          }),
        ),
      );
    };

    const init$ = from(this.modules).pipe(
      /** assign module to modules object */
      mergeMap((module) => {
        const key = module.name;
        if (!module.initialize) {
          const error = new Error(`Module ${module.name} does not have initialize method`);
          error.name = 'ModuleInitializeError';
          this._registerEvent({
            level: ModuleEventLevel.Error,
            name: '_initialize.moduleInitializeError',
            message: error.message,
            properties: {
              moduleName: module.name,
              moduleVersion: module.version?.toString() || 'unknown',
            },
            error,
          });
          throw error;
        }

        this._registerEvent({
          level: ModuleEventLevel.Debug,
          name: '_initialize.moduleInitializing',
          message: `Initializing module ${module.name}`,
          properties: {
            moduleName: module.name,
            moduleVersion: module.version?.toString() || 'unknown',
          },
        });

        const moduleInitStart = performance.now();
        return from(
          // @todo - convert to toObservable
          Promise.resolve(
            module.initialize({
              ref,
              config: config[key as keyof typeof config],
              // @ts-ignore
              requireInstance,
              hasModule,
            }) as IModuleProvider,
          ),
        ).pipe(
          map((instance) => {
            if (!(instance instanceof BaseModuleProvider)) {
              this._registerEvent({
                level: ModuleEventLevel.Warning,
                name: '_initialize.providerNotBaseModuleProvider',
                message: `Provider for module ${module.name} does not extend BaseModuleProvider`,
                properties: {
                  moduleName: module.name,
                  moduleVersion: module.version?.toString() || 'unknown',
                },
              });
            }
            if (!instance.version) {
              this._registerEvent({
                level: ModuleEventLevel.Warning,
                name: '_initialize.providerVersionWarning',
                message: `Provider for module ${module.name} does not expose version`,
                properties: {
                  moduleName: module.name,
                  moduleVersion: module.version?.toString() || 'unknown',
                },
              });
            }

            const moduleInitTime = Math.round(performance.now() - moduleInitStart);

            this._registerEvent({
              level: ModuleEventLevel.Debug,
              name: '_initialize.moduleInitialized',
              message: `Module ${module.name} initialized in ${moduleInitTime}ms`,
              properties: {
                moduleName: module.name,
                moduleVersion: module.version?.toString() || 'unknown',
                providerName: typeof instance,
                providerVersion: instance.version?.toString() || 'unknown',
                moduleInitTime,
              },
              metric: moduleInitTime,
            });
            return [key, instance];
          }),
        );
      }),
    );

    const initStart = performance.now();
    init$.subscribe({
      next: ([name, module]) => {
        /** push instance */
        instance$.next(Object.assign(instance$.value, { [name]: module }));
      },
      error: (err) => {
        this._registerEvent({
          level: ModuleEventLevel.Error,
          name: '_initialize.moduleInitializationError',
          message: `Failed to initialize module ${err.name || 'unknown'}`,
          error: err,
        });
        instance$.error(err);
      },
      complete: () => {
        const loadTime = Math.round(performance.now() - initStart);
        this._registerEvent({
          level: ModuleEventLevel.Debug,
          name: '_initialize.moduleInitializationComplete',
          message: `All modules initialized in ${loadTime}ms`,
          properties: {
            modules: Object.keys(instance$.value).join(', '),
            loadTime,
          },
          metric: loadTime,
        });
        return instance$.complete();
      },
    });

    /** await creation of all instances */
    const initStartTime = performance.now();
    const instance = await lastValueFrom(instance$);
    const initTime = Math.round(performance.now() - initStartTime);
    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: '_initialize.complete',
      message: `Modules instance created in ${initTime}ms`,
      properties: {
        modules: Object.keys(instance).join(', '),
        initTime,
      },
      metric: initTime,
    });

    Object.seal(instance);

    return instance;
  }

  /**
   * Executes post-initialization tasks.
   * @param instance - Initialized module instance.
   * @param ref - Reference object.
   */
  protected async _postInitialize<T, R = TRef>(
    instance: ModulesInstanceType<CombinedModules<T, TModules>>,
    ref?: R,
  ) {
    const { modules, _afterInit: afterInit } = this;

    const postInitialize$ = from(modules).pipe(
      filter((module): module is Required<AnyModule> => !!module.postInitialize),
      tap((module) => {
        this._registerEvent({
          level: ModuleEventLevel.Debug,
          name: '_postInitialize.modulePostInitializing',
          message: `Module ${module.name} is being post-initialized`,
          properties: {
            moduleName: module.name,
            moduleVersion: module.version?.toString() || 'unknown',
          },
        });
      }),
      mergeMap((module) => {
        const postInitStart = performance.now();
        return from(
          module.postInitialize({
            ref,
            modules: instance,
            instance:
              instance[module.name as keyof ModulesInstanceType<CombinedModules<T, TModules>>],
          }),
        ).pipe(
          tap(() => {
            const postInitTime = Math.round(performance.now() - postInitStart);
            this._registerEvent({
              level: ModuleEventLevel.Debug,
              name: '_postInitialize.modulePostInitialized',
              message: `Module ${module.name} has been post-initialized in ${postInitTime}ms`,
              metric: postInitTime,
              properties: {
                moduleName: module.name,
                moduleVersion: module.version?.toString() || 'unknown',
                postInitTime,
              },
            });
          }),
          defaultIfEmpty(null),
          catchError((err) => {
            this._registerEvent({
              level: ModuleEventLevel.Warning,
              name: '_postInitialize.modulePostInitializeError',
              message: `Module ${module.name} post-initialize failed`,
              properties: {
                moduleName: module.name,
                moduleVersion: module.version?.toString() || 'unknown',
              },
              error: err,
            });
            return EMPTY;
          }),
        );
      }),
    );

    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: '_postInitialize.modulesPostInitializing',
      message: `Post-initializing all modules [${Object.keys(instance).length}]`,
      properties: {
        modules: Object.keys(instance).join(', '),
      },
    });

    const postInitStart = performance.now();
    await lastValueFrom(postInitialize$);
    const postInitTime = Math.round(performance.now() - postInitStart);
    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: '_postInitialize.modulesPostInitializeComplete',
      message: `Post-initialization of all modules completed in ${postInitTime}ms`,
      properties: {
        modules: Object.keys(instance).join(', '),
        postInitTime: postInitTime,
      },
      metric: postInitTime,
    });

    if (afterInit.length) {
      try {
        this._registerEvent({
          level: ModuleEventLevel.Debug,
          name: '_postInitialize.afterInitHooks',
          message: `Executing post-initialize hooks [${afterInit.length}]`,
          properties: {
            hooks: afterInit.map((x) => x.name || 'anonymous').join(', '),
          },
        });
        const afterInitStart = performance.now();
        await Promise.allSettled(afterInit.map((x) => Promise.resolve(x(instance))));
        const afterInitTime = Math.round(performance.now() - afterInitStart);
        this._registerEvent({
          level: ModuleEventLevel.Debug,
          name: '_postInitialize.afterInitHooksComplete',
          message: `Post-initialize hooks completed in ${afterInitTime}ms`,
          properties: {
            hooks: afterInit.map((x) => x.name || 'anonymous').join(', '),
            afterInitTime,
          },
          metric: afterInitTime,
        });
      } catch (err) {
        this._registerEvent({
          level: ModuleEventLevel.Warning,
          name: '_postInitialize.afterInitHooksError',
          message: 'Post-initialize hooks failed',
          properties: {
            hooks: afterInit.map((x) => x.name || 'anonymous').join(', '),
          },
          error: err,
        });
      }
    }

    const postInitCompleteTime = Math.round(performance.now() - postInitStart);
    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: '_postInitialize.complete',
      message: 'Post-initialization complete',
      properties: {
        modules: Object.keys(instance).join(', '),
        postInitCompleteTime,
      },
    });
  }

  public async dispose(instance: ModulesInstanceType<TModules>, ref?: TRef): Promise<void> {
    this._registerEvent({
      level: ModuleEventLevel.Debug,
      name: 'dispose',
      message: 'Disposing modules instance',
      properties: {
        modules: Object.keys(instance).join(', '),
      },
    });
    await Promise.allSettled(
      this.modules
        .filter((module) => !!module.dispose)
        .map(async (module) => {
          if (!module.dispose) return;

          try {
            await module.dispose({
              ref,
              modules: instance,
              instance: instance[module.name as keyof typeof instance],
            });
            this._registerEvent({
              level: ModuleEventLevel.Debug,
              name: 'dispose.moduleDisposed',
              message: `Module ${module.name} disposed successfully`,
              properties: {
                moduleName: module.name,
                moduleVersion: module.version?.toString() || 'unknown',
              },
            });
          } catch (err) {
            this._registerEvent({
              level: ModuleEventLevel.Warning,
              name: 'dispose.moduleDisposeError',
              message: `Module ${module.name} dispose failed`,
              properties: {
                moduleName: module.name,
                moduleVersion: module.version?.toString() || 'unknown',
              },
              error: err,
            });
          }
        }),
    );
    this.#event$.complete();
  }
}
