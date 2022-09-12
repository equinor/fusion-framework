/* eslint-disable @typescript-eslint/no-explicit-any */
import { IModulesConfigurator } from './configurator';

import type { AnyModule, ModulesInstanceType } from './types';

/**
 * Create an instances of provided instances
 *
 * @param configure - callback for configuring configurations
 * @param modules - modules to configure
 * @param ref - reference instance (parent module instance)
 */
export const initializeModules = async <TModules extends Array<AnyModule>, TInstance = any>(
    configurator: IModulesConfigurator<TModules, TInstance>,
    ref?: TInstance
): Promise<ModulesInstanceType<TModules> & { dispose: VoidFunction }> =>
    configurator.initialize(ref);

export default initializeModules;
