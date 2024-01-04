/* eslint-disable @typescript-eslint/no-explicit-any */
import { BehaviorSubject, EMPTY, firstValueFrom, from, lastValueFrom, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, scan, tap, timeout } from 'rxjs/operators';

import { IModuleConsoleLogger, ModuleConsoleLogger } from './logger';

import type {
    AnyModule,
    CombinedModules,
    ModuleConfigType,
    ModuleInstance,
    ModulesConfig,
    ModulesConfigType,
    ModulesInstance,
    ModulesInstanceType,
    ModuleType,
} from './types';

import { SemanticVersion } from './lib/semantic-version';
import { BaseModuleProvider, type IModuleProvider } from './lib/provider';

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
    logger: IModuleConsoleLogger;

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
 * Callback function type for configuring modules.
 * @template TRef The reference type.
 * @param config The modules configuration.
 * @param ref Optional reference parameter.
 */
type ModulesConfiguratorConfigCallback<TRef> = (
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
    /**
     * Logger instance for the configurator.
     */
    public logger: ModuleConsoleLogger = new ModuleConsoleLogger('ModulesConfigurator');

    /**
     * Array of configuration callbacks.
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
        configs.forEach((x) => this.addConfig(x));
    }

    /**
     * Adds a module configurator.
     * @param config - Module configurator.
     */
    public addConfig<T extends AnyModule>(config: IModuleConfigurator<T, TRef>) {
        const { module, afterConfig, afterInit, configure } = config;
        this._modules.add(module);
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
    }

    /**
     * Registers a callback to be executed after initialization.
     * @param cb - Callback function.
     */
    public onInitialized<T>(
        cb: (instance: ModulesInstanceType<CombinedModules<T, TModules>>) => void,
    ): void {
        this._afterInit.push(cb);
    }

    /**
     * Initializes the modules with the provided reference.
     * @param ref - Reference object.
     * @returns Promise that resolves to the initialized module instance.
     */
    public async initialize<T, R extends TRef = TRef>(
        ref?: R,
    ): Promise<ModulesInstance<CombinedModules<T, TModules>>> {
        const config = await this._configure<T, R>(ref);
        const instance = await this._initialize<T, R>(config, ref);
        await this._postInitialize<T, R>(instance, ref);
        return Object.seal(
            Object.assign({}, instance, {
                dispose: () => this.dispose(instance as unknown as ModulesInstance<TModules>),
            }),
        );
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
        const { modules, logger, _afterConfiguration, _afterInit } = this;
        const config$ = from(modules).pipe(
            // TODO - handle config creation errors
            mergeMap(async (module) => {
                logger.debug(`🛠 creating configurator ${logger.formatModuleName(module)}`);
                try {
                    const configurator = await module.configure?.(ref);
                    logger.debug(
                        `🛠 created configurator for ${logger.formatModuleName(module)}`,
                        configurator,
                    );
                    return { [module.name]: configurator };
                } catch (err) {
                    logger.error(
                        `🛠 Failed to created configurator for ${logger.formatModuleName(module)}`,
                        err,
                    );
                    throw err;
                }
            }),
            scan((acc, module) => Object.assign(acc, module), {
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
        const { modules, logger, _afterConfiguration: afterConfiguration } = this;
        await Promise.allSettled(
            modules
                .filter((module) => !!module.postConfigure)
                .map(async (module) => {
                    try {
                        await module.postConfigure?.(config);
                        logger.debug(
                            `🏗📌 post configured ${logger.formatModuleName(module)}`,
                            module,
                        );
                    } catch (err) {
                        logger.warn(
                            `🏗📌 post configure failed ${logger.formatModuleName(module)}`,
                        );
                    }
                }),
        );

        /** call all added post config hooks  */
        if (afterConfiguration.length) {
            try {
                logger.debug(`🏗📌 post configure hooks [${afterConfiguration.length}]`);
                await Promise.allSettled(afterConfiguration.map((x) => Promise.resolve(x(config))));
                logger.debug(`🏗📌 post configure hooks complete`);
            } catch (err) {
                logger.warn(`🏗📌 post configure hook failed`, err);
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
        const { modules, logger } = this;
        const moduleNames = modules.map((m) => m.name);

        const instance$ = new BehaviorSubject<ModulesInstanceType<CombinedModules<T, TModules>>>(
            {} as ModulesInstanceType<CombinedModules<T, TModules>>,
        );

        const hasModule = (name: string) => moduleNames.includes(name);

        /**
         * Requires an instance of a module by name.
         *
         * @template TKey - The key type of the module.
         * @param name - The name of the module to require.
         * @param wait - The timeout duration in seconds for waiting the module to be initialized. Default is 60 seconds.
         * @returns A promise that resolves to the instance of the required module.
         * @throws Error if the module is not defined.
         * @throws RequiredModuleTimeoutError if the module initialization times out.
         */
        const requireInstance = <
            TKey extends keyof ModulesInstanceType<CombinedModules<T, TModules>>,
        >(
            name: TKey,
            wait = 60,
        ): Promise<ModulesInstanceType<CombinedModules<T, TModules>>[TKey]> => {
            if (!moduleNames.includes(name)) {
                logger.error(
                    `🚀⌛️ Cannot not require ${logger.formatModuleName(
                        String(name),
                    )} since module is not defined!`,
                );
                throw Error(`cannot not require [${String(name)}] since module is not defined!`);
            }
            if (instance$.value[name]) {
                logger.debug(
                    `🚀⌛️ ${logger.formatModuleName(String(name))} is initiated, skipping queue`,
                );
                return Promise.resolve(instance$.value[name]);
            }
            logger.debug(
                `🚀⌛️ Awaiting init ${logger.formatModuleName(String(name))}, timeout ${wait}s`,
            );
            return firstValueFrom(
                instance$.pipe(
                    filter((x) => !!x[name]),
                    map((x) => x[name]),
                    timeout({
                        each: wait * 1000,
                        with: () => throwError(() => new RequiredModuleTimeoutError()),
                    }),
                ),
            );
        };

        from(modules)
            .pipe(
                /** assign module to modules object */
                mergeMap((module) => {
                    const key = module.name;
                    logger.debug(`🚀 initializing ${logger.formatModuleName(module)}`);
                    return from(
                        Promise.resolve(
                            module.initialize({
                                ref,
                                config: config[key as keyof typeof config],
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                requireInstance,
                                hasModule,
                            }) as IModuleProvider,
                        ),
                    ).pipe(
                        map((instance) => {
                            if (
                                !(instance instanceof BaseModuleProvider) &&
                                !(instance.version instanceof SemanticVersion)
                            ) {
                                // TODO change to warn in future
                                logger.debug(
                                    `🤷 module does not extends the [BaseModuleProvider] or exposes [SemanticVersion]`,
                                );
                                try {
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    instance.version =
                                        module.version instanceof SemanticVersion
                                            ? module.version
                                            : new SemanticVersion(
                                                  module.version ?? '0.0.0-unknown',
                                              );
                                } catch (err) {
                                    logger.error(`🚨 failed to set module version`);
                                }
                            }
                            logger.debug(`🚀 initialized ${logger.formatModuleName(module)}`);
                            return [key, instance];
                        }),
                    );
                }),
            )
            .subscribe({
                next: ([name, module]) => {
                    /** push instance */
                    instance$.next(Object.assign(instance$.value, { [name]: module }));
                },
                complete: () => instance$.complete(),
            });

        /** await creation of all instances */
        const instance = await lastValueFrom(instance$);

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
        const { modules, logger, _afterInit: afterInit } = this;

        const postInitialize$ = from(modules).pipe(
            filter((module): module is Required<AnyModule> => !!module.postInitialize),
            tap((module) =>
                logger.debug(`🚀📌 post initializing moule ${logger.formatModuleName(module)}`),
            ),
            mergeMap((module) =>
                from(
                    module.postInitialize({
                        ref,
                        modules: instance,
                        instance:
                            instance[
                                module.name as keyof ModulesInstanceType<
                                    CombinedModules<T, TModules>
                                >
                            ],
                    }),
                ).pipe(
                    tap(() => {
                        logger.debug(
                            `🚀📌 post initialized moule ${logger.formatModuleName(module)}`,
                        );
                    }),
                    catchError((err) => {
                        logger.warn(
                            `🚀📌 post initialize failed moule ${logger.formatModuleName(module)}`,
                            err,
                        );
                        return EMPTY;
                    }),
                ),
            ),
        );

        /** call all added post config hooks  */
        await lastValueFrom(postInitialize$);

        if (afterInit.length) {
            try {
                logger.debug(`🚀📌 post configure hooks [${afterInit.length}]`);
                await Promise.allSettled(afterInit.map((x) => Promise.resolve(x(instance))));
                logger.debug(`🚀📌 post configure hooks complete`);
            } catch (err) {
                logger.warn(`🚀📌 post configure hook failed`, err);
            }
        }

        logger.debug(`🎉 Modules initialized ${modules.map(logger.formatModuleName)}`, instance);
        logger.info('🟢 Modules initialized');
    }

    public async dispose(instance: ModulesInstanceType<TModules>, ref?: TRef): Promise<void> {
        const { modules } = this;
        await Promise.allSettled(
            modules
                .filter((module) => !!module.dispose)
                .map(async (module) => {
                    await module.dispose?.({
                        ref,
                        modules: instance,
                        instance: instance[module.name as keyof typeof instance],
                    });
                }),
        );
    }
}
