import type { IContextProvider } from '@equinor/fusion-framework-module-context';

/**
 * Routing execution modes resolved by version gating + strategy detection.
 *
 * - `legacy` — context module < 8.0.0, forces path-only
 * - `path` — modern app, `setRoutingStrategy('path')` or default
 * - `query` — modern app, `setRoutingStrategy('query')`
 * - `custom` — modern app, `setRoutingStrategy('custom')` + has own provider
 */
export type RoutingExecutionMode = 'legacy' | 'query' | 'path' | 'custom';

interface ResolveRoutingExecutionModeInput {
  isLegacy: boolean;
  routingStrategy: IContextProvider['routingStrategy'];
  hasAppContextProvider: boolean;
}

/**
 * Deterministic resolution:
 * 1. Legacy version gate always wins
 * 2. Custom strategy requires app provider
 * 3. Query strategy writes `$contextId`
 * 4. Path (or undefined) writes path segment
 */
export const resolveRoutingExecutionMode = (
  input: ResolveRoutingExecutionModeInput,
): RoutingExecutionMode => {
  if (input.isLegacy) return 'legacy';
  if (input.routingStrategy === 'custom' && input.hasAppContextProvider) return 'custom';
  if (input.routingStrategy === 'query') return 'query';
  return 'path';
};
