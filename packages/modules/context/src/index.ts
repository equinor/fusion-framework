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

export { ContextModuleConfigurator } from './ContextModuleConfigurator.js';
export type { IContextModuleConfigurator } from './ContextModuleConfigurator.interface.js';
export type { ContextModuleConfig } from './ContextModuleConfig.js';

export { IContextProvider, ContextProvider } from './ContextProvider.js';

export {
  default,
  ContextModule,
  module as contextModule,
  moduleKey as contextModuleKey,
} from './module.js';

export { enableContext } from './utils/enable-context.js';

export * from './types.js';
