import { createContext } from 'react';

import type { FusionRouterContext } from './types.js';

/**
 * Internal React context that backs {@link useRouterContext} and
 * {@link FusionRouterContextProvider}.
 *
 * @internal
 */
export const _routerContext = createContext<FusionRouterContext | undefined>(undefined);
