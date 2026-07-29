import { _routerContext } from './_router-context.js';

/**
 * React context provider that supplies {@link FusionRouterContext} to the component tree.
 *
 * Typically you do not use this directly — the `<Router>` component sets it up
 * automatically. It is exported for advanced use cases such as testing or
 * wrapping sub-trees with a custom context value.
 */
export const FusionRouterContextProvider = _routerContext.Provider;
