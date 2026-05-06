import { extractContextIdFromPath } from '@equinor/fusion-framework-module-context/utils';
import type { IContextNavigationStrategyAdapter } from './contracts';
import { generatePathname } from '../utils/generate-pathname';

/**
 * Modern path strategy — context id as 3rd URL segment.
 * Preserves deeper sub-routes on context change.
 */
export const pathStrategyAdapter: IContextNavigationStrategyAdapter = {
  mode: 'path',
  // If context is undefined, clear the path strategy segment will do noting.
  onNonContext: ({ log }) => {
    log('🌍 Portal: Context is undefined, do nothing!');
    return undefined;
  },
  onClearContext({ appKey, appNavigation, portalNavigation, origin, log }) {
    if (appNavigation) {
      if (appNavigation?.version.major < 7) {
        log(
          `🌍 Portal: App router V(${appNavigation.version.major}) has lower version of router than portal V(${portalNavigation.version.major}), please update to match portal navigation events.`,
        );
        appNavigation.replace(`/`);
      }

      return new URL(`apps/${appKey ?? ''}/`, origin);
    }
    return new URL(`/`, origin);
  },
  appContextHandler({ appKey, currentContext, contextProvider, appNavigation, origin, log }) {
    if (!appNavigation || !currentContext) {
      log(
        `🌍 Portal: No app navigation or context available for app [${appKey}], cannot apply path strategy!`,
      );
      return undefined;
    }

    const pathname = generatePathname(
      appNavigation.path.pathname,
      currentContext,
      contextProvider,
      extractContextIdFromPath(appNavigation.path.pathname),
    );

    return new URL(pathname, origin);
  },
  portalContextHandler({ appKey, portalNavigation, currentContext, contextProvider, origin, log }) {
    if (!currentContext) {
      log(`🌍 Portal: No context available for app [${appKey}], cannot apply path strategy!`);
      return undefined;
    }

    const pathname = generatePathname(
      portalNavigation.path.pathname,
      currentContext,
      contextProvider,
      extractContextIdFromPath(portalNavigation.path.pathname),
    );

    return new URL(pathname, origin);
  },
};
