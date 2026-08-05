import type { Module } from '@equinor/fusion-framework-module';

import { StateModuleConfigurator } from './StateModuleConfigurator.js';
import StateProvider from './StateProvider.js';
import type { IStateProvider } from './StateProvider.interface.js';
import { name } from './name.js';
import type { StateModule } from './StateModule.js';

/**
 * Represents the configured state module definition for the Fusion framework.
 *
 * @returns The state module definition used to configure and initialize state.
 */
export const module: StateModule = {
  name,
  configure: () => new StateModuleConfigurator(),
  initialize: async (init) => {
    const config = await (init.config as StateModuleConfigurator).createConfigAsync(init);
    // `event` initializes concurrently with `state` - wait for it via requireInstance rather
    // than reading `init.ref`, which isn't guaranteed to be populated yet.
    const event = init.hasModule('event') ? await init.requireInstance('event') : undefined;
    const provider = new StateProvider(config, { event });
    await provider.initialize();
    return provider;
  },
};

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    state: Module<typeof name, IStateProvider, StateModuleConfigurator>;
  }
}
