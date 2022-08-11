import { IAgGridConfigurator, AgGridConfigurator } from './configurator';
import { IAgGridProvider, AgGridProvider } from './provider';
import type { Module, ModulesInstanceType } from '@equinor/fusion-framework-module';

export type AgGridModule = Module<'agGrid', IAgGridProvider, IAgGridConfigurator>;

export const module: AgGridModule = {
    name: 'agGrid',
    configure: (ref: ModulesInstanceType<[AgGridModule]>) => {
        const config = new AgGridConfigurator();
        if (ref?.agGrid) {
            config.licenseKey = ref.agGrid.licenseKey;
        }
        return config;
    },
    initialize: ({ config }): IAgGridProvider => new AgGridProvider(config),
};

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        agGrid: AgGridModule;
    }
}
