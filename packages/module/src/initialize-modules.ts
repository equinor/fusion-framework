/* eslint-disable @typescript-eslint/no-explicit-any */
import { BehaviorSubject, delayWhen, filter, from, lastValueFrom, map, mergeMap, of } from 'rxjs';

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

// TODO - create a class for initializing
const _initializeModules = async <TModules extends Array<AnyModule>>(
    modules: TModules,
    config: ModulesConfigType<TModules>
) => {
    const instance$ = new BehaviorSubject<ModulesInstanceType<TModules>>(
        {} as ModulesInstanceType<TModules>
    );

    from(modules)
        .pipe(
            delayWhen((module) => {
                const hasDeps = !!module.deps;
                if (hasDeps) {
                    logger.debug(
                        `module ${logModuleName(module)} requires dependencies`,
                        module.deps
                    );
                    return instance$.pipe(
                        filter(
                            (instance) =>
                                /** check that all dependencies are created */
                                !!module.deps?.every((dep) =>
                                    Object.keys(instance).includes(String(dep))
                                )
                        )
                    );
                }
                return of(0);
            }),
            mergeMap((module) =>
                /** assign module to modules object */
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
                instance$.next(Object.assign(instance$.value, { [name]: module }));
            },
            complete: () => instance$.complete(),
        });

    return lastValueFrom(instance$);
};

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
    const afterConfiguration: Array<(config: ModulesConfigType<TModules>) => void> = [];
    const afterInit: Array<(instance: ModulesInstanceType<TModules>) => void> = [];

    logger.debug(
        `🛠 initializing ${!ref ? 'modules' : 'sub-modules'} ${modules.map(logModuleName)}`,
        modules,
        ref
    );

    /** initialize config providers for all modules */
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

    const instance = await _initializeModules(modules, config);
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
