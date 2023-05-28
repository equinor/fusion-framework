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

export interface IModulesConfigurator<
    TModules extends Array<AnyModule> = Array<AnyModule>,
    TRef = any
> {
    logger: IModuleConsoleLogger;
    configure(...configs: Array<IModuleConfigurator<any, TRef>>): void;

    addConfig<T extends AnyModule>(config: IModuleConfigurator<T, TRef>): void;

    initialize<T extends Array<AnyModule> | unknown>(
        ref?: TRef
    ): Promise<ModulesInstance<CombinedModules<T, TModules>>>;

    onConfigured<T>(
        cb: (config: ModulesConfigType<CombinedModules<T, TModules>>) => void | Promise<void>
    ): void;

    onInitialized<T extends Array<AnyModule> | unknown>(
        cb: (instance: ModulesInstanceType<CombinedModules<T, TModules>>) => void
    ): void;

    dispose(instance: ModulesInstanceType<TModules>, ref?: TRef): Promise<void>;
}

export interface IModuleConfigurator<TModule extends AnyModule = AnyModule, TRef = ModuleInstance> {
    module: TModule;
    configure?: (config: ModuleConfigType<TModule>, ref?: TRef) => void | Promise<void>;
    afterConfig?: (config: ModuleConfigType<TModule>) => void;
    afterInit?: (instance: ModuleType<TModule>) => void | Promise<void>;
}

class RequiredModuleTimeoutError extends Error {
    constructor() {
        super('It was too slow');
        this.name = 'RequiredModuleTimeoutError';
    }
}

// const mapModuleNames = (modules: Array<AnyModule>) => modules.map((x) => x.name);

export class ModulesConfigurator<TModules extends Array<AnyModule> = Array<AnyModule>, TRef = any>
    implements IModulesConfigurator<TModules, TRef>
{
    public logger: ModuleConsoleLogger = new ModuleConsoleLogger('ModulesConfigurator');

    protected _configs: Array<
        (config: ModulesConfig<[AnyModule]>, ref?: TRef) => void | Promise<void>
    > = [];
    protected _afterConfiguration: Array<(config: any) => void> = [];
    protected _afterInit: Array<(instance: any) => void> = [];

    protected _modules: Set<AnyModule>;

    constructor(modules?: Array<AnyModule>) {
        this._modules = new Set(modules);
    }

    get modules(): Array<AnyModule> {
        return [...this._modules];
    }

    public configure(...configs: Array<IModuleConfigurator<any, TRef>>) {
        configs.forEach((x) => this.addConfig(x));
    }

    public addConfig<T extends AnyModule>(config: IModuleConfigurator<T, TRef>) {
        const { module, afterConfig, afterInit, configure } = config;
        this._modules.add(module);
        configure && this._configs.push((config, ref) => configure(config[module.name], ref));
        afterConfig && this._afterConfiguration.push((config) => afterConfig(config[module.name]));
        afterInit && this._afterInit.push((instances) => afterInit(instances[module.name]));
    }

    public onConfigured<T>(
        cb: (config: ModulesConfigType<CombinedModules<T, TModules>>) => void | Promise<void>
    ) {
        this._afterConfiguration.push(cb);
    }

    public onInitialized<T>(
        cb: (instance: ModulesInstanceType<CombinedModules<T, TModules>>) => void
    ): void {
        this._afterInit.push(cb);
    }

    public async initialize<T, R extends TRef = TRef>(
        ref?: R
    ): Promise<ModulesInstance<CombinedModules<T, TModules>>> {
        const config = await this._configure<T, R>(ref);
        const instance = await this._initialize<T, R>(config, ref);
        await this._postInitialize<T, R>(instance, ref);
        return Object.seal(
            Object.assign({}, instance, {
                dispose: () => this.dispose(instance as unknown as ModulesInstance<TModules>),
            })
        );
    }

    protected async _configure<T, R extends TRef = TRef>(
        ref?: R
    ): Promise<ModulesConfig<CombinedModules<T, TModules>>> {
        const config = await this._createConfig<T, R>(ref);
        await Promise.all(this._configs.map((x) => Promise.resolve(x(config, ref))));
        await this._postConfigure<T>(config);
        return config;
    }

    protected _createConfig<T, R = TRef>(
        ref?: R
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
                        configurator
                    );
                    return { [module.name]: configurator };
                } catch (err) {
                    logger.error(
                        `🛠 Failed to created configurator for ${logger.formatModuleName(module)}`,
                        err
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
            } as ModulesConfig<CombinedModules<T, TModules>>)
        );

        return lastValueFrom(config$);
    }

    protected async _postConfigure<T>(
        config: ModulesConfigType<CombinedModules<T, TModules>>
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
                            module
                        );
                    } catch (err) {
                        logger.warn(`🏗📌 post configure failed ${logger.formatModuleName(module)}`);
                    }
                })
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

    protected async _initialize<T, R = TRef>(
        config: ModulesConfigType<CombinedModules<T, TModules>>,
        ref?: R
    ): Promise<ModulesInstanceType<CombinedModules<T, TModules>>> {
        const { modules, logger } = this;
        const moduleNames = modules.map((m) => m.name);

        const instance$ = new BehaviorSubject<ModulesInstanceType<CombinedModules<T, TModules>>>(
            {} as ModulesInstanceType<CombinedModules<T, TModules>>
        );

        const hasModule = (name: string) => moduleNames.includes(name);

        const requireInstance = <
            TKey extends keyof ModulesInstanceType<CombinedModules<T, TModules>>
        >(
            name: TKey,
            wait = 60
        ): Promise<ModulesInstanceType<CombinedModules<T, TModules>>[TKey]> => {
            if (!moduleNames.includes(name)) {
                logger.error(
                    `🚀⌛️ Cannot not require ${logger.formatModuleName(
                        String(name)
                    )} since module is not defined!`
                );
                throw Error(`cannot not require [${String(name)}] since module is not defined!`);
            }
            if (instance$.value[name]) {
                logger.debug(
                    `🚀⌛️ ${logger.formatModuleName(String(name))} is initiated, skipping queue`
                );
                return Promise.resolve(instance$.value[name]);
            }
            logger.debug(
                `🚀⌛️ Awaiting init ${logger.formatModuleName(String(name))}, timeout ${wait}s`
            );
            return firstValueFrom(
                instance$.pipe(
                    filter((x) => !!x[name]),
                    map((x) => x[name]),
                    timeout({
                        each: wait * 1000,
                        with: () => throwError(() => new RequiredModuleTimeoutError()),
                    })
                )
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
                            }) as IModuleProvider
                        )
                    ).pipe(
                        map((instance) => {
                            if (
                                !(instance instanceof BaseModuleProvider) &&
                                !(instance.version instanceof SemanticVersion)
                            ) {
                                // TODO change to warn in future
                                logger.debug(
                                    `🤷 module does not extends the [BaseModuleProvider] or exposes [SemanticVersion]`
                                );
                                try {
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    instance.version = module.version instanceof SemanticVersion 
                                        ? module.version 
                                        : new SemanticVersion(
                                            module.version ?? '0.0.0-unknown'
                                        );
                                } catch (err) {
                                    logger.error(`🚨 failed to set module version`);
                                }
                            }
                            logger.debug(`🚀 initialized ${logger.formatModuleName(module)}`);
                            return [key, instance];
                        })
                    );
                })
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

    protected async _postInitialize<T, R = TRef>(
        instance: ModulesInstanceType<CombinedModules<T, TModules>>,
        ref?: R
    ) {
        const { modules, logger, _afterInit: afterInit } = this;

        const postInitialize$ = from(modules).pipe(
            filter((module): module is Required<AnyModule> => !!module.postInitialize),
            tap((module) =>
                logger.debug(`🚀📌 post initializing moule ${logger.formatModuleName(module)}`)
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
                    })
                ).pipe(
                    tap(() => {
                        logger.debug(
                            `🚀📌 post initialized moule ${logger.formatModuleName(module)}`
                        );
                    }),
                    catchError((err) => {
                        logger.warn(
                            `🚀📌 post initialize failed moule ${logger.formatModuleName(module)}`,
                            err
                        );
                        return EMPTY;
                    })
                )
            )
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
                })
        );
    }
}
