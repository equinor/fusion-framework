import { Module } from '@equinor/fusion-framework-module';

import { EventModule } from '@equinor/fusion-framework-module-event';
import { ServicesModule } from '@equinor/fusion-framework-module-services';

import { IContextModuleConfigurator, ContextModuleConfigurator } from './configurator';
import { IContextProvider, ContextProvider } from './provider';

export type ContextModuleKey = 'context';

export const moduleKey: ContextModuleKey = 'context';

export type ContextModule = Module<
    ContextModuleKey,
    IContextProvider,
    IContextModuleConfigurator,
    [ServicesModule, EventModule]
>;

export const module: ContextModule = {
    name: moduleKey,
    configure: () => new ContextModuleConfigurator(),
    initialize: async (args) => {
        const config = await args.config.createConfig(args);
        const event = args.hasModule('event') ? await args.requireInstance('event') : undefined;
        return new ContextProvider({ config, event });
    },
};

export default module;
