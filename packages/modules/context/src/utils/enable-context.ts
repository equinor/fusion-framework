import type {
    IModulesConfigurator,
    AnyModule,
    ModuleInitializerArgs,
} from '@equinor/fusion-framework-module';
import type { IContextModuleConfigurator } from '../configurator';
import type { ContextConfigBuilder } from '../ContextConfigBuilder';

import { module } from '../module';

/**
 * Method for enabling the Service module.
 * @param configurator - The module configurator to which the context configuration will be added.
 * @param builder - An optional function that takes a ContextConfigBuilder instance and optionally returns a Promise.
 *                  It is used to provide additional configuration for the context module.
 */
export const enableContext = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configurator: IModulesConfigurator<any, any>,
    builder?: <TDeps extends Array<AnyModule> = []>(
        builder: ContextConfigBuilder<
            TDeps,
            ModuleInitializerArgs<IContextModuleConfigurator, TDeps>
        >,
    ) => void | Promise<void>,
): void => {
    configurator.addConfig({
        module,
        configure: (contextConfigurator) => {
            builder && contextConfigurator.addConfigBuilder(builder);
        },
    });
};
