import { IModulesConfigurator } from '@equinor/fusion-framework-module';
import { IContextModuleConfig } from './configurator';

import { module } from './module';
/**
 * Method for enabling the Service module
 * @param configurator - configuration object
 */
export const enableContext = (
    configurator: IModulesConfigurator,
    options?: Pick<IContextModuleConfig, 'contextFilter' | 'contextType'>
): void => {
    configurator.addConfig({
        module,
        configure: (contextConfigurator) => {
            contextConfigurator.processConfig = (config) => {
                return {
                    ...config,
                    ...options,
                };
            };
        },
    });
};

export {
    ContextModuleConfigurator,
    IContextModuleConfigurator,
    IContextModuleConfig,
} from './configurator';

export { IContextProvider, ContextProvider } from './provider';

export {
    default,
    ContextModule,
    module as contextModule,
    moduleKey as contextModuleKey,
} from './module';

export * from './types';
