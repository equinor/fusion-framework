/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
    AnyModule,
    ModulesConfig,
    ModulesConfigType,
    ModulesConfigurator,
    ModulesInstanceType,
} from './types';

/**
 * Create an instances of provided instances
 *
 * @param configure - callback for configuring configurations
 * @param modules - modules to configure
 * @param ref - reference instance (parent module instance)
 */
export const initializeModules = async <
    TModules extends Array<AnyModule> = Array<AnyModule>,
    TInstance extends any = any
>(
    configure: ModulesConfigurator<TModules, TInstance>,
    modules: TModules,
    ref?: TInstance
): Promise<ModulesInstanceType<TModules>> => {
    const afterConfiguration: Array<(config: ModulesConfigType<TModules>) => void> = [];
    const afterInit: Array<(instance: ModulesInstanceType<TModules>) => void> = [];

    /** initialize config providers for all modules */
    const config: ModulesConfig<TModules> = await Object.values(modules).reduce(
        async (acc, module) => {
            const obj = await acc;
            const res = await Promise.resolve(module.configure?.(ref));
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

    /** allow callback to configure */
    configure && (await configure(config as any, ref));

    /** call all added post config hooks  */
    await Promise.all(
        [...modules.map((x) => x.postConfigure), ...afterConfiguration].map((x) =>
            Promise.resolve(x?.(config))
        )
    );

    /** call module initializers */
    const instance = await modules.reduce(async (acc, module) => {
        const obj = await acc;
        const res = await Promise.resolve(
            module.initialize(config as unknown as ModulesConfigType<TModules>, obj)
        );
        return Object.assign(obj, { [module.name]: res });
    }, Promise.resolve({} as ModulesInstanceType<TModules>));

    /** Protected instances */
    Object.seal(ref);

    /** call all added post config hooks  */
    await Promise.all(
        [...modules.map((x) => x.postInitialize), ...afterInit].map((x) =>
            Promise.resolve(x?.(instance))
        )
    );

    return instance;
};

export default initializeModules;
