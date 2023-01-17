import { Module } from '@equinor/fusion-framework-module';
import { ModuleDeps } from './types';

import { IWidgetConfigurator, WidgetConfigurator } from './WidgetConfigurator';
import { IWidgetModuleProvider, WidgetModuleProvider } from './WidgetModuleProvider';

export const moduleKey = 'widget';

export type WidgetModule = Module<
    typeof moduleKey,
    IWidgetModuleProvider,
    IWidgetConfigurator,
    ModuleDeps
>;

export const module: WidgetModule = {
    name: moduleKey,
    configure: () => new WidgetConfigurator('1.0-preview'),
    initialize: async (args) => {
        const config = await (args.config as WidgetConfigurator).createConfig(args);
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
