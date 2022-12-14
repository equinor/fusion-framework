import { IModulesConfigurator, Module } from '@equinor/fusion-framework-module';
import { ModuleDeps } from './types';

import { IAppConfigurator, AppConfigurator } from './AppConfigurator';
import { AppModuleProvider } from './AppModuleProvider';

export const moduleKey = 'app';

export type AppModule = Module<typeof moduleKey, AppModuleProvider, IAppConfigurator, ModuleDeps>;

export const module: AppModule = {
    name: moduleKey,
    configure: () => new AppConfigurator(),
    initialize: async (args) => {
        const config = await (args.config as AppConfigurator).createConfig(args);
        const event = await args.requireInstance('event').catch(() => undefined);
        return new AppModuleProvider({ config, event });
    },
    dispose: (args) => {
        (args.instance as unknown as AppModuleProvider).dispose();
    },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const enableAppModule = (configurator: IModulesConfigurator<any, any>) => {
    configurator.addConfig({ module });
};

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        app: AppModule;
    }
}
