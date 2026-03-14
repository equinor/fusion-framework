import { createContext, useContext } from 'react';
import { createContext as createRouterContext } from 'react-router';

import type { FusionRouterContext } from './types.js';

/**
 * React Router context key for Fusion Framework router context.
 *
 * This context is used to inject Fusion Framework modules and custom context
 * into route loaders, actions, and components. The Router component sets this
 * context with the FusionRouterContext containing modules and custom context.
 *
 * Route loaders, actions, and components can access this context via the `fusion`
 * parameter/prop that is automatically injected.
 */
export const routerContext = createRouterContext<FusionRouterContext | undefined>(undefined);
const _routerContext = createContext<FusionRouterContext | undefined>(undefined);

/**
 * React hook that returns the current {@link FusionRouterContext}.
 *
 * Provides access to Fusion Framework modules and custom context from within
 * route components, loaders, or any React component rendered inside the `<Router>`.
 *
 * @returns The current Fusion router context containing `modules` and `context`.
 * @throws {Error} If called outside a `<Router>` (no `FusionRouterContextProvider` ancestor).
 *
 * @example
 * ```tsx
 * import { useRouterContext } from '@equinor/fusion-framework-react-router';
 *
 * function MyComponent() {
 *   const { modules, context } = useRouterContext();
 *   const httpClient = modules.http.createHttpClient('my-api');
 *   // ...
 * }
 * ```
 */
export function useRouterContext(): FusionRouterContext {
  const context = useContext(_routerContext);
  if (!context) {
    throw new Error('useRouterContext must be used within a RouterContextProvider');
  }
  return context;
}

/**
 * React context provider that supplies {@link FusionRouterContext} to the component tree.
 *
 * Typically you do not use this directly — the `<Router>` component sets it up
 * automatically. It is exported for advanced use cases such as testing or
 * wrapping sub-trees with a custom context value.
 */
export const FusionRouterContextProvider = _routerContext.Provider;
