import type { IContextNavigationStrategyAdapter } from './contracts';
import { CONTEXT_QUERY_PARAM_KEY } from '../utils/query-utils';

/**
 * Modern query strategy — context id in `$contextId` query parameter.
 * Handles canonicalization: moves context from path to query when needed.
 */
export const queryStrategyAdapter: IContextNavigationStrategyAdapter = {
  mode: 'query',
  onNonContext: ({ log }) => {
    log('🌍 Portal: Context is undefined, do nothing!');
    return undefined;
  },
  onClearContext({
    appKey,
    appNavigation,
    portalNavigation,
    origin,
    currentPathname,
    currentSearch,
    log,
  }) {
    log(`🌍 Portal: Context cleared for app [${appKey}], removing query param.`);

    if (appNavigation) {
      if (appNavigation.version.major < 7) {
        console.warn(
          `🌍 Portal: App router V(${appNavigation.version.major}) has lower version of router than portal V(${portalNavigation.version.major}), please update to match portal navigation events.`,
        );
        appNavigation.replace(`/`);
      }
    }

    const url = new URL(currentPathname, origin);
    url.search = currentSearch ?? '';
    url.searchParams.delete(CONTEXT_QUERY_PARAM_KEY);
    return url;
  },
  portalContextHandler({ appKey, portalNavigation, currentContext, origin, log }) {
    if (!currentContext) {
      log(`🌍 Portal: No context available for app [${appKey}], cannot apply query strategy!`);
      return undefined;
    }

    const url = new URL(portalNavigation.path.pathname, origin);
    url.search = portalNavigation.path.search ?? '';
    url.searchParams.set(CONTEXT_QUERY_PARAM_KEY, currentContext.id);

    log(
      `🌍 Portal: Context changed, setting query param on portal URL for app [${appKey}]:`,
      `[${url.pathname}${url.search}]`,
    );

    return url;
  },
};
