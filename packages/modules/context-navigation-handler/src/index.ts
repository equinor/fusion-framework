// ─── Module ─────────────────────────────────────────────────────────
export { module, moduleKey } from './module';
export type { ContextNavigationHandlerModule, ContextNavigationHandlerModuleKey } from './module';

// ─── Enable function ────────────────────────────────────────────────
export { enableContextNavigationHandler } from './enable';

// ─── Provider ───────────────────────────────────────────────────────
export { ContextNavigationHandlerProvider } from './provider';

// ─── Configuration ──────────────────────────────────────────────────
export { ContextNavigationHandlerConfigurator } from './configurator';

// ─── Types ──────────────────────────────────────────────────────────
export type {
  ContextNavigationHandlerConfig,
  ContextRoutingStrategy,
  RoutingStrategyId,
  ContextState,
  ReconcilerPhase,
  ContextNavigationHandlerNavigateDetail,
  ContextNavigationHandlerNavigatedDetail,
  ContextNavigationHandlerStrategyResolvedDetail,
  ContextNavigationHandlerSkippedDetail,
} from './types';

// ─── Events (module augmentation — side-effect import) ──────────────
import './events';

// ─── Strategies ─────────────────────────────────────────────────────
export { queryStrategy, pathStrategy, createCustomStrategy } from './strategies';
export type { CustomStrategyOptions } from './strategies';
