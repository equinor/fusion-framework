import { createContext } from 'react-router';

import type { RouteOperationTarget } from './RouteRecoveryScope.js';

/**
 * Private per-execution context entry linking middleware to the operation and `Router` that
 * started the execution. Set by the Fusion `Router` in `getContext`; `null` outside it.
 */
export const routeOperationContext = createContext<RouteOperationTarget | null>(null);

export default routeOperationContext;
