import type { RoutingExecutionMode } from '../orchestrator/routing-mode-orchestrator';
import { customStrategyAdapter } from './custom-adapter';
import { legacyPathStrategyAdapter } from './legacy-path-adapter';
import { pathStrategyAdapter } from './path-strategy-adapter';
import { queryStrategyAdapter } from './query-strategy-adapter';
import type { IContextNavigationStrategyAdapter } from './contracts';

const adapterRegistry: Record<RoutingExecutionMode, IContextNavigationStrategyAdapter> = {
  legacy: legacyPathStrategyAdapter,
  query: queryStrategyAdapter,
  path: pathStrategyAdapter,
  custom: customStrategyAdapter,
};

export const getContextNavigationStrategyAdapter = (
  mode: RoutingExecutionMode,
): IContextNavigationStrategyAdapter => adapterRegistry[mode];
