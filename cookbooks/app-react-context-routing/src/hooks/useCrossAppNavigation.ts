/**
 * Hook that exposes cross-app navigation for verifying context handoff
 * between sibling apps in the dev-portal.
 *
 * Prefers the framework `NavigationModule` for seamless SPA transitions;
 * falls back to `location.assign` when running outside a portal host.
 *
 * @module useCrossAppNavigation
 */

import { useFrameworkModule } from '@equinor/fusion-framework-react';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

import { getPortalAppHref } from '../utils/url';

/**
 * Provides a `navigateToApp` function that navigates to a sibling app
 * inside the dev-portal while handing off the active context.
 *
 * @returns Object with the `navigateToApp` callback
 *
 * @example
 * ```tsx
 * const { navigateToApp } = useCrossAppNavigation();
 * <Button onClick={() => navigateToApp('meetings')}>Meetings</Button>
 * ```
 */
export function useCrossAppNavigation(): { navigateToApp: (appKey: string) => void } {
  const portalNavigation = useFrameworkModule<NavigationModule>('navigation');

  const navigateToApp = (appKey: string): void => {
    if (portalNavigation) {
      portalNavigation.navigate(`/apps/${appKey}`);
    } else {
      globalThis.location.assign(getPortalAppHref(appKey));
    }
  };

  return { navigateToApp };
}
