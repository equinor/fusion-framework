import { IAgGridConfigurator, AgGridConfigurator } from './configurator';
import { IAgGridProvider, AgGridProvider } from './provider';
import type {
    IModuleConfigurator,
    Module,
    ModulesInstanceType,
} from '@equinor/fusion-framework-module';

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

export const configureAgGrid = (args: {
    licenseKey: string;
}): IModuleConfigurator<AgGridModule> => ({
    module,
    configure: (config) => {
        config.licenseKey = args.licenseKey;
    },
});

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        agGrid: AgGridModule;
    }
}
