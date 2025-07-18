import type { Module, IModulesConfigurator } from '@equinor/fusion-framework-module';
import { type IStateProvider, StateProvider } from './StateProvider';
import { StateConfigurator, type IStateModuleConfigurator } from './StateModuleConfigurator';
import { IStateItem, StateItem } from './StateItem';

export {IStateItem, StateItem};
export const name = 'state';
export type StateModule = Module<typeof name, IStateProvider, IStateModuleConfigurator>;

export type StateModuleBuilderCallback = (
  builder: IStateModuleConfigurator,
) => void | Promise<void>;

export const module: StateModule = {
  name,
  configure: () => new StateConfigurator(),
  initialize: async (init) => {
    const config = await init.config.createConfigAsync(init);
    return new StateProvider({ config });
  },
};

export const enableState = (
  // biome-ignore lint/suspicious/noExplicitAny: should allow any
  configurator: IModulesConfigurator<any, any>,
  callback?: StateModuleBuilderCallback,
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

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    [name]: StateModule;
  }
}

export default module;
