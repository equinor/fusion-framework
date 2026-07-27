import { useContext } from 'react';

import { _routerContext } from './router-context-internal.js';

import type { FusionRouterContext } from './types.js';

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
  // Fail fast when the hook is used outside of a RouterContextProvider
  if (!context) {
    throw new Error('useRouterContext must be used within a RouterContextProvider');
  }
  return context;
}
