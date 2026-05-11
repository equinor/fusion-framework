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
  ContextNavigationAdapterFactory,
  ContextNavigationAdapterInput,
  AdapterResolutionContext,
  ContextNavigationHandlerConfig,
  ContextState,
  ReconcilerPhase,
  ReconcilerSourceEntry,
  ReconcilerSourceDeps,
  ReconcilerSourceFactory,
  ContextNavigationHandlerNavigateDetail,
  ContextNavigationHandlerNavigatedDetail,
  ContextNavigationHandlerAdapterResolvedDetail,
  ContextNavigationHandlerSkippedDetail,
} from './types';

// Built-in adapters
export { createPathAdapter } from './adapters/path-adapter';
export { createQueryAdapter } from './adapters/query-adapter';
export { createCustomAdapter } from './adapters/custom-adapter';

// Built-in source factories
export { createAppFirstSource } from './sources/app-first-source';
export { createContextFirstSource } from './sources/context-first-source';

// Utils
export { hasCustomContextGenerators } from './utils/has-custom-context-generators';
export { enableLegacyAppNavigationFix } from './utils/legacy-app-navigation-fix';

// Events (side-effect: augments FrameworkEventMap)
import './events';

// Version
export { version } from './version';
