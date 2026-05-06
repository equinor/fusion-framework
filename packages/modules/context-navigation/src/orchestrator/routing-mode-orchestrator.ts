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
  routingStrategy: IContextProvider['routingStrategy'] | undefined;
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
  console.debug(
    `🌍 Portal: Resolving routing execution mode with input:`,
    JSON.stringify(input, null, 2),
  );
  switch (input.routingStrategy) {
    case 'query':
      return 'query';
    case 'custom':
      return input.hasAppContextPathGenerators ? 'custom' : 'path';
    case 'path':
      return 'path';
    default:
      return !input.hasAppContextPathGenerators ? 'path' : 'custom';
  }
};

/**
 * Heuristic to detect if the app has a context-aware routing strategy, by checking for the presence of path generator functions on the provider. This is used to determine if the 'custom' strategy can be used, which requires the app to handle its own routing logic. If these functions are not present, we fall back to 'path' strategy to maintain compatibility with apps that do not have context-aware routing.
 *
 * @param {IContextProvider} provider
 * @return {*}  {boolean}
 */
export const resolveHasAppPathGenerators = (provider?: IContextProvider): boolean => {
  if (!provider) {
    console.debug(
      `🌍 Portal: No context provider found, assuming no context path generators are available!`,
    );
    return false;
  }

  return !!provider.generatePathFromContext && !!provider.extractContextIdFromPath;
};
