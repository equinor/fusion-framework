import type { AnyModule, IModulesConfigurator } from '@equinor/fusion-framework-module';
import type { IStateModuleConfigurator } from './StateModuleConfigurator.js';
import { module } from './StateModule.js';

/**
 * Enables the state module within the provided modules configurator.
 *
 * @template TDeps - The tuple of module dependencies.
 * @template TRef - The reference type for the configurator.
 * @param configurator - The modules configurator to which the state module will be added.
 * @param configure - Optional callback to further configure the state module.
 *
 * @remarks
 * This function registers the state module with the given configurator and allows
 * for optional asynchronous configuration via the `configure` callback.
 */
export const enableStateModule = <TDeps extends Array<AnyModule>, TRef>(
  configurator: IModulesConfigurator<TDeps, TRef>,
  configure?: (builder: IStateModuleConfigurator) => void | Promise<void>,
) => {
  configurator.addConfig({
    module,
    configure: async (config) => await configure?.(config),
  });
};
