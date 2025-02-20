import {
  type IModulesConfigurator,
  type Module,
  type ModulesInstanceType,
} from '@equinor/fusion-framework-module';

import { AgGridConfigurator } from './AgGridConfigurator';
import { defaultModules } from './default-modules';
import { IAgGridProvider, AgGridProvider } from './AgGridProvider';

import { type IAgGridConfigurator } from './AgGridConfigurator.interface';

import { fusionTheme, createThemeFromTheme } from './themes';

export type AgGridModule = Module<'agGrid', IAgGridProvider, IAgGridConfigurator>;

export type AgGridBuilderCallback = (builder: IAgGridConfigurator) => void | Promise<void>;

export const module: AgGridModule = {
  name: 'agGrid',
  configure: (ref?: ModulesInstanceType<[AgGridModule]>) => {
    const licenseKey = ref?.agGrid?.licenseKey;

    const theme = ref?.agGrid?.theme ? createThemeFromTheme(ref.agGrid.theme) : fusionTheme;
    return new AgGridConfigurator({
      licenseKey,
      theme,
      modules: defaultModules,
    });
  },

  initialize: async (args) => {
    const configurator = args.config as AgGridConfigurator;
    const config = await configurator.createConfigAsync(args);
    return new AgGridProvider(config);
  },
};

export const enableAgGrid = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configurator: IModulesConfigurator<any, any>,
  callback?: AgGridBuilderCallback,
): void => {
  configurator.addConfig({
    module,
    configure: async (config) => {
      if (callback) {
        return Promise.resolve(callback(config));
      }
    },
  });
};

export default module;

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    agGrid: AgGridModule;
  }
}
