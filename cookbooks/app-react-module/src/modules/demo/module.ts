import { Module } from '@equinor/fusion-framework-module';
import { DemoModuleConfigurator } from './configurator';
import DemoProvider from './provider';

export type DemoModule = Module<'demo', DemoProvider, DemoModuleConfigurator>;

export const demoModule: DemoModule = {
    name: 'demo',
    configure() {
        const config = new DemoModuleConfigurator();
        return config;
    },
    initialize: async (args) => {
        const config = await args.config.createConfigAsync(args, {
            foo: 'elg',
        });
        const module = new DemoProvider(config);
        return module;
    },
};

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        demo: DemoModule;
    }
}
