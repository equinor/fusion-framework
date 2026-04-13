import { useCallback } from 'react';

import { useCurrentAppModules } from '@equinor/fusion-framework-react/app';

import type {
  ContextItem,
  ContextModule,
  IContextProvider,
} from '@equinor/fusion-framework-module-context';
import { extractContextIdFromPath } from '@equinor/fusion-framework-module-context/utils';

import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

import { useObservableSubscription } from '@equinor/fusion-observable/react';
import { EMPTY } from 'rxjs';
import { useFrameworkModule } from '@equinor/fusion-framework-react';

type CurrentAppModules = [ContextModule, NavigationModule];

/**
 * Builds the navigation pathname when the context changes.
 *
 * If a context ID already exists in the current pathname (`pathContextId`),
 * it is replaced with the new context item's ID. Otherwise a new path
 * segment is appended. Falls back to the context provider's
 * `generatePathFromContext` when available.
 *
 * @param currentPathname - The current URL pathname.
 * @param item - The newly selected context item.
 * @param context - Optional context provider with a custom path generator.
 * @param pathContextId - Existing context ID found in the current URL, if any.
 * @returns The generated pathname string for navigation.
 */
const generatePathname = (
  currentPathname: string,
  item: ContextItem,
  context?: IContextProvider,
  pathContextId?: string,
) => {
  if (pathContextId) {
    // context id exists in the url, replace it with the new context id
    const pathname =
      context?.generatePathFromContext?.(item, currentPathname) ??
      currentPathname.replace(pathContextId, item.id);

    console.debug(
      `🌍 Portal: context changed, navigating to app's context url:`,
      `found context id [${pathContextId}] in url, replacing with [${pathname}]`,
    );

    return pathname;
  }
  // could not find context id in the url, set the path to the new context id
  const pathname = context?.generatePathFromContext?.(item, currentPathname) ?? `/${item?.id}`;

  console.debug(
    `🌍 Portal: context changed, navigating to app's context url:`,
    `could not find context id in url, navigating to path [${pathname}]`,
  );

  return pathname;
};

/**
 * Observes the current application's context changes and synchronizes the URL.
 *
 * When the loaded app exposes both a context and navigation module, this hook
 * subscribes to `currentContext$`. On context change it updates the URL
 * pathname — either replacing an existing context ID segment or appending one.
 * When context is cleared, navigation resets to the root path.
 *
 * Uses the app's own navigation instance when available, falling back to the
 * portal-level navigation module.
 */
export const useAppContextNavigation = () => {
  // use the framework navigation instance
  const navigation = useFrameworkModule<NavigationModule>('navigation');

  // use the current application modules
  const { modules } = useCurrentAppModules<CurrentAppModules>();
  // use the application context and navigation from the current application modules
  const { context, navigation: appNavigation } = modules ?? {};

  // subscribe to the context changes
  useObservableSubscription(
    // if the context is not available, use an empty observable
    context?.currentContext$ ?? EMPTY,
    // when the context changes, navigate to the new context
    useCallback(
      (item: ContextItem | undefined | null) => {
        // sanity check, if the item or navigation is undefined, early return
        if (item === undefined || navigation === undefined) {
          return;
        }

        // resolve the app base path (application base fragment of url)
        const currentPathname = appNavigation
          ? // if the app has its own navigation, use it to resolve the app base path
            appNavigation.path.pathname
          : // if the app does not have its own navigation, use the portal navigation to resolve the app base path
            navigation.path.pathname;

        console.debug(
          '🌍 Portal:',
          appNavigation
            ? 'App has its own navigation, using it to navigate.'
            : 'App does not have its own navigation, using portal navigation.',
        );

        /** context was cleared  */
        if (item === null) {
          console.debug('🌍 Portal:', 'current context was cleared, navigating to root');
          if (appNavigation) {
            appNavigation.replace('/');
          } else {
            navigation.replace('/');
          }
          return;
        }

        const pathname = generatePathname(
          currentPathname,
          item,
          context,
          context?.extractContextIdFromPath?.(currentPathname) ??
            extractContextIdFromPath(currentPathname),
        );

        // always navigate via the portal navigation to trigger the synthetic pop() workaround,
        // ensuring app routers that listen only for POP actions detect the URL change
        if (appNavigation) {
          // resolve the full URL via the app navigation (includes app basename),
          // then hand it to the portal navigation which will not double-prefix when basename is empty
          const newUrl = appNavigation.createURL({ pathname });
          navigation.navigate(newUrl, { replace: true });
        } else {
          // pass the pathname directly so navigation.navigate does not re-run createURL
          // (which would duplicate the basename if one is configured)
          navigation.navigate({ pathname }, { replace: true });
        }
      },
      [
        // framework navigation instance, should not change
        navigation,
        // application navigation instance, may change when the application changes
        appNavigation,
        context,
      ],
    ),
  );
};
