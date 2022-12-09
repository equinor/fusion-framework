import { IModulesConfigurator, Module } from '@equinor/fusion-framework-module';
import { ModuleDeps } from './types';

import { IAppConfigurator, AppConfigurator } from './configurator';
import { AppModuleProvider } from './AppModuleProvider';

export const moduleKey = 'app';

export type AppModule = Module<
    typeof moduleKey,
    AppModuleProvider,
    IAppConfigurator<ModuleDeps>,
    ModuleDeps
>;

export const module: AppModule = {
    name: moduleKey,
    configure: () => new AppConfigurator(),
    initialize: async (args) => {
        const config = await args.config.createConfig(args);
        const event = await args.requireInstance('event').catch(() => undefined);
        return new AppModuleProvider({ config, event });
    },
    dispose: (args) => {
        (args.instance as unknown as AppModuleProvider).dispose();
    },
};

export const enableAppModule = (configurator: IModulesConfigurator) => {
    configurator.addConfig({ module });
};

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        app: AppModule;
    }
}
