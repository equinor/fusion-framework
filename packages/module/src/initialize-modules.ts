/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
    AnyModule,
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
    /** initialize config providers for all modules */
    const config = await Object.values(modules).reduce(async (acc, module) => {
        const obj = await acc;
        const res = await Promise.resolve(module.configure?.(ref));
        return Object.assign(obj, { [module.name]: res });
    }, Promise.resolve({} as ModulesConfigType<TModules>));

    /** protected config instance */
    Object.seal(config);

    /** allow callback to configure */
    configure && (await configure(config as any, ref));

    /** call all post config hooks */
    await Promise.all(
        Object.values(modules).map((x) => Promise.resolve(x.postConfigure?.(config)))
    );

    /** call module initializers */
    const instance = await modules.reduce(async (acc, module) => {
        const obj = await acc;
        const res = await Promise.resolve(module.initialize(config, obj));
        return Object.assign(obj, { [module.name]: res });
    }, Promise.resolve({} as ModulesInstanceType<TModules>));

    /** Protected instances */
    Object.seal(ref);

    /** call all post initializers hooks */
    await Promise.all(modules.map((x) => Promise.resolve(x.postInitialize?.(instance))));

    return instance;
};

export default initializeModules;
