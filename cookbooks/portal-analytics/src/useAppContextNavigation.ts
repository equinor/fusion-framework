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
 * Generates a pathname for navigation based on the current pathname,
 * context item, and optional context provider. If a `pathContextId` is provided,
 * it replaces the existing context ID in the pathname. Otherwise, it constructs
 * a new pathname using the context item's ID.
 *
 * @param currentPathname - The current URL pathname.
 * @param item - The context item containing the ID to be used in the pathname.
 * @param context - An optional context provider with a method to generate a pathname from the context item.
 * @param pathContextId - An optional context ID present in the current URL to be replaced.
 * @returns The generated pathname for navigation.
 */
const generatePathname = (
  currentPathname: string,
  item: ContextItem | null,
  context?: IContextProvider,
  pathContextId?: string,
) => {
  if (!item) {
    console.debug('🌍 Portal: no context item provided, navigating to root');
    return '/';
  }
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
 * when current application changes, this hook will observe the application module instances.
 * If the module has Context and Navigation, this hook will navigate when the context changes
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

        console.debug(
          '🌍 Portal:',
          appNavigation
            ? 'App has its own navigation, using it to navigate.'
            : 'App does not have its own navigation, using portal navigation.',
        );

        // resolve the app base path (application base fragment of url)
        const currentPathname = appNavigation
          ? // if the app has its own navigation, use it to resolve the app base path
            appNavigation.path.pathname
          : // if the app does not have its own navigation, use the portal navigation to resolve the app base path
            navigation.path.pathname;

        const pathname = generatePathname(
          currentPathname,
          item,
          context,
          context?.extractContextIdFromPath?.(currentPathname) ??
            extractContextIdFromPath(currentPathname),
        );

        // generate the new url using the app navigation if available, otherwise use the portal navigation
        const newUrl = appNavigation
          ? appNavigation.createURL({ pathname })
          : navigation.createURL({ pathname });

        console.debug('🌍 Portal: navigating to url', newUrl);

        navigation.navigate(newUrl, { replace: true });
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
