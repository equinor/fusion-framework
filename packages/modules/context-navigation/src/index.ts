// ─── Module ─────────────────────────────────────────────────────────
export { module, moduleKey } from './module';
export type { ContextNavigationModule, ContextNavigationModuleKey } from './module';

// ─── Enable function ────────────────────────────────────────────────
export { enableContextNavigation } from './enable-context-navigation';

// ─── Provider ───────────────────────────────────────────────────────
export { ContextNavigationProvider } from './provider';

// ─── Configuration ──────────────────────────────────────────────────
export { ContextNavigationConfigurator } from './configurator';
export type {
  ContextNavigationConfig,
  OnCustomStrategyDetectedCallback,
  NullContextHandler,
  SourceFactory,
  SourceFactoryDeps,
  ContextNavigationSourceEmission,
} from './types';

// ─── Orchestrator ───────────────────────────────────────────────────
export { contextNavigationOrchestrator } from './orchestrator/context-navigation-orchestrator';
export type { OrchestratedNavigationResult } from './orchestrator/context-navigation-orchestrator';
export { resolveRoutingExecutionMode } from './orchestrator/routing-mode-orchestrator';
export type { RoutingExecutionMode } from './orchestrator/routing-mode-orchestrator';
export { mergeContextProviders } from './orchestrator/context-provider-adapter';

// ─── Navigation executors ───────────────────────────────────────────
export { resolveNavigationExecutor } from './navigation-executors';
export type { INavigationExecutor, ExecutedNavigation } from './navigation-executors';

// ─── Source factories ───────────────────────────────────────────────
export { createAppFirstSource } from './sources/app-first-source';
export { createContextFirstSource } from './sources/context-first-source';

// ─── Strategy adapters ──────────────────────────────────────────────
export type {
  NavigationInstruction,
  IContextNavigationStrategyAdapter,
  ContextChangeStrategyInput,
  AppSwitchStrategyInput,
} from './strategy-adapters/contracts';
export { getContextNavigationStrategyAdapter } from './strategy-adapters/registry';
