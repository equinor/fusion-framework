import { createContext } from 'react-router';

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
export const routerContext = createContext<FusionRouterContext | undefined>(undefined);
