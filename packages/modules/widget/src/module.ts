import { Module } from '@equinor/fusion-framework-module';
import { ModuleDeps } from './types';

import { IWidgetModuleConfigurator, WidgetModuleConfigurator } from './WidgetModuleConfigurator';
import { IWidgetModuleProvider, WidgetModuleProvider } from './WidgetModuleProvider';

export const moduleKey = 'widget';

export type WidgetModule = Module<
    typeof moduleKey,
    IWidgetModuleProvider,
    IWidgetModuleConfigurator,
    ModuleDeps
>;

export const module: WidgetModule = {
    name: moduleKey,
    configure: () => new WidgetModuleConfigurator('1.0-preview'),
    initialize: async (args) => {
        const config = await (args.config as WidgetModuleConfigurator).createConfig(args);
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
        widget: WidgetModule;
    }
}
