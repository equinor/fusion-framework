import { StateWithReplicaProvider } from './provider';
import { StateWithReplicaConfigurator } from './configurator';
import type { Module } from '@equinor/fusion-framework-module';

export type StateWithReplicaModule = Module<
  'state',
  StateWithReplicaProvider,
  StateWithReplicaConfigurator
>;

export const module: StateWithReplicaModule = {
  name: 'state',
  configure: () => new StateWithReplicaConfigurator(),
  initialize: async (init) => {
    const config = await (init.config as StateWithReplicaConfigurator).createConfigAsync(init);
    const provider = new StateWithReplicaProvider(config);
    await provider.initialize();
    return provider;
  },
};
