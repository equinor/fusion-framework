import { IAgGridConfigurator, AgGridConfigurator } from './configurator';
import { IAgGridProvider, AgGridProvider } from './provider';
import type { Module } from '@equinor/fusion-framework-module';

export type TelemetryModule = Module<'agGrid', IAgGridProvider, IAgGridConfigurator>;

export const module: TelemetryModule = {
    name: 'agGrid',
    configure: () => new AgGridConfigurator(),
    initialize: ({ agGrid: config }, { agGrid: provider }): IAgGridProvider =>
        new AgGridProvider(config, provider),
};

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        agGrid: TelemetryModule;
    }
}
