import { Module } from '@equinor/fusion-framework-module';
import { ModuleDeps } from './types';

import { IAppConfigurator, AppConfigurator } from './configurator';
import { AppProvider, IAppProvider } from './provider';

export const moduleKey = 'app';

export type AppModule = Module<
    typeof moduleKey,
    IAppProvider,
    IAppConfigurator<ModuleDeps>,
    ModuleDeps
>;

export const module: AppModule = {
    name: moduleKey,
    configure: () => new AppConfigurator(),
    initialize: async (args) => {
        const config = await args.config.createConfig(args);
        const event = await args.requireInstance('event').catch(() => undefined);
        return new AppProvider({ config, event });
    },
    dispose: (args) => {
        (args.instance as unknown as AppProvider).dispose();
    },
};

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        app: AppModule;
    }
}
