/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    BehaviorSubject,
    filter,
    firstValueFrom,
    from,
    lastValueFrom,
    map,
    mergeMap,
    throwError,
    timeout,
} from 'rxjs';

import type {
    AnyModule,
    ModulesConfig,
    ModulesConfigType,
    ModulesConfigurator,
    ModulesInstanceType,
} from './types';

// TODO - move to own lib ;)
class ConsoleLogger {
    constructor(protected domain: string) {}

    /** @inheritdoc */
    protected _createMessage(msg: unknown[]): unknown[] {
        return [
            `%c FUSION FRAMEWORK %c ${this.domain} %c %s`,
            'background: rgb(179, 13, 47); color: white; padding: 1px;',
            'background: rgb(244, 244, 244); color: rgb(36, 55, 70); padding: 1px;',
            'background: none; color: inherit',
            ...msg.reduce((c: unknown[], n: unknown) => [...c, n, '\n'], []),
        ];
    }

    debug(...msg: unknown[]) {
        process.env.NODE_ENV === 'development' && console.debug(...this._createMessage(msg));
    }
    info(...msg: unknown[]) {
        console.info(...this._createMessage(msg));
    }
    warn(...msg: unknown[]) {
        console.warn(...this._createMessage(msg));
    }
    error(...msg: unknown[]) {
        console.error(...this._createMessage(msg));
    }
}

const logModuleName = (module: AnyModule) =>
    `\u001b[1;32m${module.name.replace(/([A-Z])/g, ' $1').toUpperCase()}\x1b[0m`;

const logger = new ConsoleLogger('MODULES');

class RequiredModuleTimeoutError extends Error {
    constructor() {
        super('It was too slow');
        this.name = 'RequiredModuleTimeoutError';
    }
}

/**
 * Create an instances of provided instances
 *
 * @param configure - callback for configuring configurations
 * @param modules - modules to configure
 * @param ref - reference instance (parent module instance)
 */
export const initializeModules = async <TModules extends Array<AnyModule>, TInstance = any>(
    configure: ModulesConfigurator<TModules, TInstance>,
    modules: TModules,
    ref?: TInstance
): Promise<ModulesInstanceType<TModules>> => {
    const instance$ = new BehaviorSubject<ModulesInstanceType<TModules>>(
        {} as ModulesInstanceType<TModules>
    );

    /** extract module names from provided modules */
    const moduleNames = modules.map((m) => m.name);

    const afterConfiguration: Array<(config: ModulesConfigType<TModules>) => void> = [];
    const afterInit: Array<(instance: ModulesInstanceType<TModules>) => void> = [];

    logger.debug(
        `🛠 initializing ${!ref ? 'modules' : 'sub-modules'} ${modules.map(logModuleName)}`,
        modules,
        ref
    );

    /** initialize config providers for all modules */
    // TODO: make configs init in parallel
    const config: ModulesConfig<TModules> = await Object.values(modules).reduce(
        async (acc, module) => {
            logger.debug(`configuring ${logModuleName(module)}`);
            const obj = await acc;
            const res = await Promise.resolve(module.configure?.(ref));
            logger.debug(`configured ${logModuleName(module)}`);
            return Object.assign(obj, { [module.name]: res });
        },
        Promise.resolve({
            onAfterConfiguration(cb: (config: ModulesConfigType<TModules>) => void) {
                afterConfiguration.push(cb);
            },
            onAfterInit(cb: (instance: ModulesInstanceType<TModules>) => void) {
                afterInit.push(cb);
            },
        } as ModulesConfig<TModules>)
    );

    /**
     * Add method for allowing modules to await other module instance when initiating
     * WARNING: this might create stall-lock if developer does not implement correctly!
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    config.requireInstance = <TKey extends keyof ModulesInstanceType<TModules>>(
        name: TKey,
        wait = 60
    ): Promise<ModulesInstanceType<TModules>[TKey]> => {
        if (!moduleNames.includes(name)) {
            throw Error(`cannot not require [${String(name)}] since module is not defined!`);
        }
        if (instance$.value[name]) {
            logger.debug(`Module [${String(name)}] is initiated, skipping queue`);
            return Promise.resolve(instance$.value[name]);
        }
        logger.info(`Awaiting init of module [${String(name)}]`);
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

    /** protected config instance */
    Object.seal(config);

    logger.debug(`✅ Configured ${modules.map(logModuleName)}`, config);

    /** allow callback to configure */
    configure && (await configure(config as any, ref));

    /** call all added post config hooks  */
    await Promise.all(
        [...modules.map((x) => x.postConfigure), ...afterConfiguration].map((x) =>
            Promise.resolve(x?.(config))
        )
    );

    from(modules)
        .pipe(
            /** assign module to modules object */
            mergeMap((module) =>
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                from(Promise.resolve(module.initialize(config, instance$.value))).pipe(
                    map((instance) => {
                        logger.debug(`initialized ${logModuleName(module)}`);
                        return [module.name, instance];
                    })
                )
            )
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
    logger.debug('✅ initialized');

    /** Protected instances */
    Object.seal(ref);

    /** call all added post config hooks  */
    const postInitialize = [...modules.map((x) => x.postInitialize), ...afterInit];
    await Promise.all(postInitialize.map((x) => Promise.resolve(x?.(instance))));
    logger.debug('✅ post initialized');

    logger.info(
        `🚀 ${!ref ? 'modules' : 'sub-modules'} ready`,
        process.env.NODE_ENV === 'development' && instance
    );

    return instance;
};

export default initializeModules;
