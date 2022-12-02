import type {
    IModulesConfigurator,
    AnyModule,
    ModuleInitializerArgs,
} from '@equinor/fusion-framework-module';
import type { IContextModuleConfigurator } from 'configurator';
import type { ContextConfigBuilder } from 'ContextConfigBuilder';

import { module } from './module';

/**
 * Method for enabling the Service module
 * @param configurator - configuration object
 */
export const enableContext = (
    configurator: IModulesConfigurator,
    builder?: <TDeps extends Array<AnyModule> = []>(
        builder: ContextConfigBuilder<
            TDeps,
            ModuleInitializerArgs<IContextModuleConfigurator, TDeps>
        >
    ) => void | Promise<void>
): void => {
    configurator.addConfig({
        module,
        configure: (contextConfigurator) => {
            builder && contextConfigurator.addConfigBuilder(builder);
        },
    });
};
