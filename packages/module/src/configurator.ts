/* eslint-disable @typescript-eslint/no-explicit-any */
import { BehaviorSubject, firstValueFrom, from, lastValueFrom, throwError } from 'rxjs';
import { filter, map, mergeMap, scan, timeout } from 'rxjs/operators';

import { ModuleConsoleLogger } from './logger';

import type {
    AnyModule,
    ModuleConfigType,
    ModuleInstance,
    ModulesConfig,
    ModulesConfigType,
    ModulesInstance,
    ModulesInstanceType,
    ModuleType,
} from './types';

export interface IModulesConfigurator<TModules extends Array<AnyModule> = [], TRef = any> {
    configure<T extends Array<AnyModule> = TModules>(
        ...configs: Array<IModuleConfigurator<T[number]>>
    ): void;

    addConfig<T extends AnyModule = TModules[number]>(config: IModuleConfigurator<T>): void;

    initialize<T extends Array<AnyModule> = TModules>(ref?: TRef): Promise<ModulesInstance<T>>;

    onConfigured<T extends Array<AnyModule> = TModules>(
        cb: (config: ModulesConfigType<T>) => void | Promise<void>
    ): void;

    onInitialized<T extends Array<AnyModule> = TModules>(
        cb: (instance: ModulesInstanceType<T>) => void
    ): void;

    dispose<T extends Array<AnyModule> = TModules>(
        instance: ModulesInstanceType<T>,
        ref?: TRef
    ): Promise<void>;
}

export interface IModuleConfigurator<TModule extends AnyModule, TRef = ModuleInstance> {
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

export class ModulesConfigurator<TModules extends Array<AnyModule>, TRef = any>
    implements IModulesConfigurator<TModules, TRef>
{
    public logger: ModuleConsoleLogger = new ModuleConsoleLogger('ModulesConfigurator');

    protected _configs: Array<(config: ModulesConfig<[AnyModule]>) => void | Promise<void>> = [];
    protected _afterConfiguration: Array<(config: any) => void> = [];
    protected _afterInit: Array<(instance: any) => void> = [];

    protected _modules: Set<AnyModule>;

    constructor(modules?: Array<AnyModule>) {
        this._modules = new Set(modules);
    }

    get modules(): Array<AnyModule> {
        return [...this._modules];
    }

    public configure<T extends Array<AnyModule> = TModules>(
        ...configs: Array<IModuleConfigurator<T[number]>>
    ) {
        configs.forEach((x) => this.addConfig<T[number]>(x));
    }

    public addConfig<T extends AnyModule>(config: IModuleConfigurator<T>) {
        const { module, afterConfig, afterInit, configure } = config;
        this._modules.add(module);
        configure && this._configs.push((config) => configure(config[module.name]));
        afterConfig && this._afterConfiguration.push((config) => afterConfig(config[module.name]));
        afterInit && this._afterInit.push((instances) => afterInit(instances[module.name]));
    }

    public onConfigured<T extends Array<AnyModule> = TModules>(
        cb: (config: ModulesConfigType<T>) => void | Promise<void>
    ) {
        this._afterConfiguration.push(cb);
    }

    public onInitialized<T extends Array<AnyModule> = TModules>(
        cb: (instance: ModulesInstanceType<T>) => void
    ): void {
        this._afterInit.push(cb);
    }

    public async initialize<T extends Array<AnyModule> = TModules, R = TRef>(
        ref?: R
    ): Promise<ModulesInstance<T>> {
        const config = await this._configure<T, R>(ref);
        const instance = await this._initialize<T, R>(config, ref);
        await this._postInitialize<T, R>(instance, ref);
        return Object.seal(Object.assign({}, instance, { dispose: () => this.dispose(instance) }));
    }

    protected async _configure<T extends Array<AnyModule> = TModules, R = TRef>(
        ref?: R
    ): Promise<ModulesConfig<T>> {
        const config = await this._createConfig<T, R>(ref);
        await Promise.all(this._configs.map((x) => Promise.resolve(x(config))));
        await this._postConfigure<T>(config);
        return config;
    }

    protected _createConfig<T extends Array<AnyModule> = TModules, R = TRef>(
        ref?: R
    ): Promise<ModulesConfig<T>> {
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
            } as ModulesConfig<T>)
        );

        return firstValueFrom(config$) as Promise<ModulesConfig<T>>;
    }

    protected async _postConfigure<T extends Array<AnyModule> = TModules>(
        config: ModulesConfigType<T>
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

    protected async _initialize<T extends Array<AnyModule> = TModules, R = TRef>(
        config: ModulesConfigType<T>,
        ref?: R
    ): Promise<ModulesInstanceType<T>> {
        const { modules, logger } = this;
        const moduleNames = modules.map((m) => m.name);

        const instance$ = new BehaviorSubject<ModulesInstanceType<T>>({} as ModulesInstanceType<T>);

        const requireInstance = <TKey extends keyof ModulesInstanceType<T>>(
            name: TKey,
            wait = 60
        ): Promise<ModulesInstanceType<T>[TKey]> => {
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
                        each: wait,
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
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            module.initialize({ ref, config: config[key], requireInstance })
                        )
                    ).pipe(
                        map((instance) => {
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

    protected async _postInitialize<T extends Array<AnyModule> = TModules, R = TRef>(
        instance: ModulesInstanceType<T>,
        ref?: R
    ) {
        const { modules, logger, _afterInit: afterInit } = this;
        /** call all added post config hooks  */
        await Promise.allSettled(
            modules
                .filter((x) => !!x.postInitialize)
                .map(async (module) => {
                    try {
                        logger.debug(
                            `🚀📌 post initializing moule ${logger.formatModuleName(module)}`
                        );
                        await module.postInitialize?.({
                            ref,
                            modules: instance,
                            instance: instance[module.name as keyof ModulesInstanceType<T>],
                        });
                        logger.debug(
                            `🚀📌 post initialized moule ${logger.formatModuleName(module)}`
                        );
                    } catch (err) {
                        logger.warn(
                            `🚀📌 post initialize failed moule ${logger.formatModuleName(module)}`
                        );
                    }
                })
        );

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

    public async dispose<T extends Array<AnyModule> = TModules, R = TRef>(
        instance: ModulesInstanceType<T>,
        ref?: R
    ): Promise<void> {
        const { modules } = this;
        await Promise.allSettled(
            modules
                .filter((module) => !!module.dispose)
                .map(async (module) => {
                    await module.dispose?.({
                        ref,
                        modules: instance,
                        instance: instance[module.name],
                    });
                })
        );
    }
}
