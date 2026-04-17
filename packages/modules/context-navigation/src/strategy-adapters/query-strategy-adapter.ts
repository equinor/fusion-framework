import {
  buildQuerySearchWithContextId,
  stripContextSegmentFromAppPath,
} from '../utils/navigation-helpers';
import { readContextIdFromAppPath, CONTEXT_QUERY_PARAM_KEY } from '../utils/url-utils';
import type {
  AppSwitchStrategyInput,
  ContextChangeStrategyInput,
  IContextNavigationStrategyAdapter,
} from './contracts';

/**
 * Modern query strategy — context id in `$contextId` query parameter.
 * Handles canonicalization: moves context from path to query when needed.
 */
export const queryStrategyAdapter: IContextNavigationStrategyAdapter = {
  mode: 'query',
  onContextChange(input: ContextChangeStrategyInput) {
    if (input.newContext === null) {
      const extractedContextId = input.activeContextProvider?.extractContextIdFromPath?.(
        input.portalPathname,
      );
      const pathname = stripContextSegmentFromAppPath(input.portalPathname, extractedContextId);
      const params = new URLSearchParams((input.portalSearch ?? '').replace(/^\?/, ''));
      params.delete(CONTEXT_QUERY_PARAM_KEY);
      const search = Array.from(params.entries())
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      return { pathname, search: search ? `?${search}` : '' };
    }

    // Canonicalize: if context is in path, move it to query
    const pathContextId = input.activeContextProvider?.extractContextIdFromPath?.(
      input.portalPathname,
    );
    const parsedPathContextId = readContextIdFromAppPath(input.portalPathname);
    const pathname =
      pathContextId === input.newContext.id || parsedPathContextId === input.newContext.id
        ? stripContextSegmentFromAppPath(input.portalPathname, pathContextId ?? parsedPathContextId)
        : input.portalPathname;

    return {
      pathname,
      search: buildQuerySearchWithContextId(input.portalSearch, input.newContext.id),
    };
  },
  onAppSwitch(input: AppSwitchStrategyInput) {
    return {
      pathname: input.newPathname,
      search: buildQuerySearchWithContextId(input.newSearch, input.contextIdToCarry),
    };
  },
};
