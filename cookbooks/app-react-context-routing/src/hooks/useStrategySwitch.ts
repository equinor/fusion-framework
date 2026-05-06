/**
 * Hook that switches between context-routing strategies at runtime.
 *
 * When the developer clicks a strategy button, this hook rewrites the
 * browser URL so the context id moves between query-string and path
 * positions, then triggers a full page reload so the app re-initialises
 * with the new strategy.
 *
 * @module useStrategySwitch
 */

import { useLocation, useNavigate } from '@equinor/fusion-framework-react-router';
import { useFrameworkModule } from '@equinor/fusion-framework-react';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

import type { ContextMode } from '../utils/strategy';
import { hasPathContext, replaceAppPathSuffix, stripContextFromPath } from '../utils/url';
import { resolvePathFromContext, resolveCustomPathFromContext } from '../utils/context-path';

/** Return type of {@link useStrategySwitch}. */
interface StrategySwitchActions {
  /** Switches to the given strategy and reloads the page. */
  setRoutingStrategy: (nextStrategy: ContextMode) => void;
  /** Removes all context references from the URL. */
  removeContextFromUrl: () => void;
}

/**
 * Provides actions for switching between routing strategies and
 * clearing context from the URL.
 *
 * Both actions trigger a full page reload because the routing strategy
 * is read once during app initialisation.
 *
 * @returns Actions for strategy switching and context removal
 */
export function useStrategySwitch(): StrategySwitchActions {
  const location = useLocation();
  const appNavigate = useNavigate();
  const portalNavigation = useFrameworkModule<NavigationModule>('navigation');

  const setRoutingStrategy = (nextStrategy: ContextMode): void => {
    const url = new URL(globalThis.location.href);

    if (nextStrategy === 'none') {
      url.searchParams.delete('routingStrategy');
    } else {
      url.searchParams.set('routingStrategy', nextStrategy);
    }

    const queryContext = url.searchParams.get('$contextId');

    // Convert query-based context to path-based when switching to path/none
    const shouldConvertToPath =
      (nextStrategy === 'path' || nextStrategy === 'none') &&
      Boolean(queryContext) &&
      !hasPathContext(location.pathname);

    // Convert query-based context to custom-path layout
    const shouldConvertToCustom = nextStrategy === 'custom' && Boolean(queryContext);

    if (shouldConvertToPath && queryContext) {
      const nextAppPath = resolvePathFromContext(location.pathname, queryContext);
      url.pathname = replaceAppPathSuffix(url.pathname, location.pathname, nextAppPath);
      url.searchParams.delete('$contextId');
    }

    if (shouldConvertToCustom && queryContext) {
      const nextAppPath = resolveCustomPathFromContext(location.pathname, queryContext);
      url.pathname = replaceAppPathSuffix(url.pathname, location.pathname, nextAppPath);
      url.searchParams.delete('$contextId');
    }

    globalThis.location.assign(url.toString());
  };

  const removeContextFromUrl = (): void => {
    const url = new URL(globalThis.location.href);
    url.searchParams.delete('$contextId');

    // Strip path-based context segments
    if (hasPathContext(location.pathname)) {
      const nextAppPath = stripContextFromPath(location.pathname);
      url.pathname = replaceAppPathSuffix(url.pathname, location.pathname, nextAppPath);
    }

    if (appNavigate) {
      appNavigate(url, { replace: false });
    } else if (portalNavigation) {
      portalNavigation.navigate(url, { replace: false });
    } else {
      globalThis.location.assign(url.toString());
    }
  };

  return { setRoutingStrategy, removeContextFromUrl };
}
