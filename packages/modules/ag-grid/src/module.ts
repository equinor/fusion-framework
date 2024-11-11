import { type IAgGridConfigurator, AgGridConfigurator } from './configurator';
import { type IAgGridProvider, AgGridProvider } from './provider';
import type {
    IModuleConfigurator,
    IModulesConfigurator,
    Module,
    ModulesInstanceType,
} from '@equinor/fusion-framework-module';

export type AgGridModule = Module<'agGrid', IAgGridProvider, IAgGridConfigurator>;

export const module: AgGridModule = {
    name: 'agGrid',
    configure: (ref?: ModulesInstanceType<[AgGridModule]>) => {
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

export const enableAgGrid = (
    // biome-ignore  lint/suspicious/noExplicitAny: allowed in this case
    config: IModulesConfigurator<any, any>,
    options?: {
        licenseKey: string;
    },
): void => {
    options ? config.addConfig(configureAgGrid(options)) : config.configure({ module });
};

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        agGrid: AgGridModule;
    }
}
