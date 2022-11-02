import { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module } from './module';
/**
 * Method for enabling the Service module
 * @param config - configuration object
 */
export const enableContext = (config: IModulesConfigurator): void => {
    config.addConfig({ module });
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
