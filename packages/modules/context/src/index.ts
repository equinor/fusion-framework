/**
 * Context module for the Fusion Framework.
 *
 * Provides context management for Fusion-based applications and portals,
 * including setting, querying, validating, and resolving context items.
 *
 * Use {@link enableContext} to register the module in a configurator,
 * then access the {@link IContextProvider} from the module instance
 * to interact with context state.
 *
 * @packageDocumentation
 */

export {
  ContextModuleConfigurator,
  IContextModuleConfigurator,
  ContextModuleConfig,
} from './configurator';

export { IContextProvider, ContextProvider } from './ContextProvider';

export {
  default,
  ContextModule,
  module as contextModule,
  moduleKey as contextModuleKey,
} from './module';

export { enableContext } from './utils/enable-context';

export * from './types';
