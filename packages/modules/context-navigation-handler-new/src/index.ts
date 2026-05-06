// Module
export { module, moduleKey } from './module';
export type { ContextNavigationHandlerModule, ContextNavigationHandlerModuleKey } from './module';

// Provider
export { ContextNavigationHandlerProvider } from './provider';
export type { ContextNavigationHandlerProviderArgs } from './provider';

// Configurator
export { ContextNavigationHandlerConfigurator } from './configurator';

// Enable helper
export { enableContextNavigationHandler } from './enable';

// Types
export type {
  ContextNavigationAdapter,
  AdapterResolutionContext,
  ContextNavigationHandlerConfig,
  ContextState,
  ReconcilerPhase,
  ContextNavigationHandlerNavigateDetail,
  ContextNavigationHandlerNavigatedDetail,
  ContextNavigationHandlerAdapterResolvedDetail,
  ContextNavigationHandlerSkippedDetail,
} from './types';

// Built-in adapters
export { createPathAdapter } from './adapters/path-adapter';
export { createQueryAdapter } from './adapters/query-adapter';
export { createCustomAdapter, createBoundCustomAdapter } from './adapters/custom-adapter';

// Events (side-effect: augments FrameworkEventMap)
import './events';

// Version
export { version } from './version';
