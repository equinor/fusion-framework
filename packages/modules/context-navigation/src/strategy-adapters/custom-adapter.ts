import type { IContextNavigationStrategyAdapter } from './contracts';
import { generatePathname } from '../utils/generate-pathname';

/**
 * Custom strategy — context id handled by app-specific logic.
 * Preserves deeper sub-routes on context change.
 */
export const customAdapter: IContextNavigationStrategyAdapter = {
  mode: 'custom',
  // If context is undefined, clear the path strategy segment will do noting.
  onNonContext: ({ log }) => {
    log('🌍 Portal: Context is undefined, do nothing!');
    return undefined;
  },
  onClearContext({ appKey, appNavigation, portalNavigation, origin, log }) {
    log(`🌍 Portal: Context cleared, navigating to app [${appKey}] root url!`);

    log(appKey, appNavigation, portalNavigation);
    if (appNavigation) {
      if (appNavigation?.version.major < 7) {
        console.warn(
          `🌍 Portal: App router V(${appNavigation.version.major}) has lower version of router than portal V(${portalNavigation.version.major}), please update to match portal navigation events.`,
        );
        appNavigation.replace(`/`);
      }

      return new URL(`apps/${appKey ?? ''}/`, origin);
    }

    return new URL(`/`, origin);
  },
  appContextHandler({ appKey, currentContext, contextProvider, appNavigation, origin, log }) {
    if (!appNavigation || !currentContext || !contextProvider.extractContextIdFromPath) {
      log(
        `🌍 Portal: No app navigation, context or context extraction function available for app [${appKey}], cannot apply custom strategy!`,
      );
      return undefined;
    }

    const pathname = generatePathname(
      appNavigation.path.pathname,
      currentContext,
      contextProvider,
      contextProvider.extractContextIdFromPath(appNavigation.path.pathname),
    );

    log(
      `🌍 Portal: Context changed, navigating to app's context url:`,
      `generated path [${pathname}] using custom strategy!`,
    );

    return new URL(pathname, origin);
  },
};
