import { Module } from '@equinor/fusion-framework-module';
import { ModuleDeps } from './types';

import { WidgetModuleConfigurator } from './WidgetModuleConfigurator';
import { IWidgetModuleProvider, WidgetModuleProvider } from './WidgetModuleProvider';

export const moduleKey = 'widget';

export type WidgetModule = Module<
    typeof moduleKey,
    IWidgetModuleProvider,
    WidgetModuleConfigurator,
    ModuleDeps
>;

export const module: WidgetModule = {
    name: moduleKey,
    configure() {
        const config = new WidgetModuleConfigurator();
        return config;
    },
    initialize: async (args) => {
        const config = await args.config.createConfigAsync(args);
        const event = await args.requireInstance('event').catch(() => undefined);
        return new WidgetModuleProvider({ config, event });
    },
    dispose: (args) => {
        (args.instance as unknown as WidgetModuleProvider).dispose();
    },
};

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        [moduleKey]: WidgetModule;
    }
}
