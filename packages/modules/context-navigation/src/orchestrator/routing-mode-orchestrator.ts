import type { IContextProvider } from '@equinor/fusion-framework-module-context';

/**
 * Routing execution modes resolved by version gating + strategy detection.
 *
 * - `legacy` — context module < 8.0.0, forces path-only
 * - `path` — modern app, `setRoutingStrategy('path')` or default
 * - `query` — modern app, `setRoutingStrategy('query')`
 * - `custom` — modern app, `setRoutingStrategy('custom')` + has own provider
 */
export type RoutingExecutionMode = 'query' | 'path' | 'custom';

interface ResolveRoutingExecutionModeInput {
  routingStrategy: IContextProvider['routingStrategy'];
  hasAppContextPathGenerators: boolean;
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
  switch (input.routingStrategy) {
    case 'query':
      return 'query';
    case 'custom':
      return input.hasAppContextPathGenerators ? 'custom' : 'path';
    case 'path':
      return 'path';
    default:
      return 'path';
  }
};
