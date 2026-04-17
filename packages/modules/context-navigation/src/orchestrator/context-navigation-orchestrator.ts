import type { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';
import { coerce } from 'semver';

import {
  resolveRoutingExecutionMode,
  type RoutingExecutionMode,
} from './routing-mode-orchestrator';
import { getContextNavigationStrategyAdapter } from '../strategy-adapters/registry';
import type { NavigationInstruction } from '../strategy-adapters/contracts';

// ─── Input types ────────────────────────────────────────────────────

interface ContextChangeOrchestratorInput {
  newContext: ContextItem | null;
  activeContextProvider: IContextProvider;
  hasAppContextProvider: boolean;
  portalPathname: string;
  portalSearch: string;
}

interface AppSwitchOrchestratorInput {
  newPathname: string;
  newSearch: string;
  contextIdToCarry: string;
  activeContextProvider: IContextProvider;
  hasAppContextProvider: boolean;
}

export interface OrchestratedNavigationResult {
  mode: RoutingExecutionMode;
  instruction: NavigationInstruction | undefined;
}

// ─── Version utilities ──────────────────────────────────────────────

const extractContextModuleMajorVersion = (
  version: IContextProvider['version'] | undefined,
): number | undefined => {
  if (version === undefined || version === null) return undefined;
  if (typeof version === 'object' && 'major' in version) {
    const major = (version as { major?: unknown }).major;
    if (typeof major === 'number' && Number.isFinite(major)) return major;
  }
  return coerce(String(version))?.major;
};

const isLegacyContextModule = (version: IContextProvider['version'] | undefined): boolean => {
  const major = extractContextModuleMajorVersion(version);
  return major === undefined || major < 8;
};

// ─── Orchestrator ───────────────────────────────────────────────────

export const contextNavigationOrchestrator = {
  onContextChange(input: ContextChangeOrchestratorInput): OrchestratedNavigationResult {
    const mode = resolveRoutingExecutionMode({
      isLegacy: isLegacyContextModule(input.activeContextProvider.version),
      routingStrategy: input.activeContextProvider.routingStrategy,
      hasAppContextProvider: input.hasAppContextProvider,
    });

    const adapter = getContextNavigationStrategyAdapter(mode);
    const instruction = adapter.onContextChange({
      newContext: input.newContext,
      activeContextProvider: input.activeContextProvider,
      portalPathname: input.portalPathname,
      portalSearch: input.portalSearch,
    });

    return { mode, instruction };
  },

  onAppSwitch(input: AppSwitchOrchestratorInput): OrchestratedNavigationResult {
    const mode = resolveRoutingExecutionMode({
      isLegacy: isLegacyContextModule(input.activeContextProvider.version),
      routingStrategy: input.activeContextProvider.routingStrategy,
      hasAppContextProvider: input.hasAppContextProvider,
    });

    const adapter = getContextNavigationStrategyAdapter(mode);
    const instruction = adapter.onAppSwitch({
      newPathname: input.newPathname,
      newSearch: input.newSearch,
      contextIdToCarry: input.contextIdToCarry,
      activeContextProvider: input.activeContextProvider,
    });

    return { mode, instruction };
  },
};
