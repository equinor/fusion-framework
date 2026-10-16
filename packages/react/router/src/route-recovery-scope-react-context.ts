import { createContext } from 'react';

import type { RouteRecoveryScope } from './RouteRecoveryScope.js';

/**
 * React context exposing the recovery scope of the enclosing Fusion `Router` to its elements.
 * `null` outside a Fusion `Router`.
 */
export const routeRecoveryScopeReactContext = createContext<RouteRecoveryScope | null>(null);

export default routeRecoveryScopeReactContext;
