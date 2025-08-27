import type { AnyModule, IModulesConfigurator } from '@equinor/fusion-framework-module';
import type { IAppConfigurator } from '@equinor/fusion-framework-react-app';

import type { StateWithReplicaConfigurator } from './configurator';

import { module } from './module';

export const enableModule = <M extends AnyModule[]>(
  configurator: IAppConfigurator<M>,
  configure?: (builder: StateWithReplicaConfigurator) => void | Promise<void>,
) => {
  configurator.addConfig({
    module,
    configure: async (config) => await configure?.(config),
  });
};
