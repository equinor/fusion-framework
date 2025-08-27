import type {
  IModulesConfigurator,
  AnyModule,
  ModuleInitializerArgs,
} from '@equinor/fusion-framework-module';
import type { IContextModuleConfigurator } from '../configurator';
import type { ContextConfigBuilder } from '../ContextConfigBuilder';

import { module } from '../module';

/**
 * Enables context configuration for a given modules configurator.
 *
 * @param configurator - The modules configurator instance to which the context module will be added.
 * @param builder - An optional function that receives a context configuration builder. This function can be used to further configure the context module. It can be asynchronous.
 *
 * @remarks
 * This utility function adds the context module to the provided configurator and optionally applies additional configuration using the provided builder function.
 *
 * @example
 * ```ts
 * import { enableContext } from '@equinor/fusion-framework-module-context';
 *
 * const configure = (configurator: IModulesConfigurator<any, any>) => {
 *   enableContext(configurator, (builder) => {
 *     // configure the context module here
 *   });
 * };
 * ```
 */
export const enableContext = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  builder?: <TDeps extends Array<AnyModule> = []>(
    builder: ContextConfigBuilder<TDeps, ModuleInitializerArgs<IContextModuleConfigurator, TDeps>>,
  ) => void | Promise<void>,
): void => {
  configurator.addConfig({
    module,
    configure: (contextConfigurator) => {
      builder && contextConfigurator.addConfigBuilder(builder);
    },
  });
};
