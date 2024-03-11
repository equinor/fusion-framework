import { useCallback } from 'react';

import { useCurrentAppModules } from '@equinor/fusion-framework-react/app';

import { ContextItem, type ContextModule } from '@equinor/fusion-framework-module-context';
import { extractContextIdFromPath } from '@equinor/fusion-framework-module-context/utils';

import { NavigationModule } from '@equinor/fusion-framework-module-navigation';

import { useObservableSubscription } from '@equinor/fusion-observable/react';
import { EMPTY } from 'rxjs';
import { useFrameworkModule } from '@equinor/fusion-framework-react';

type CurrentAppModules = [ContextModule, NavigationModule];

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

                // extract the context id from the current path
                const pathContextId = extractContextIdFromPath(currentPathname);

                // generate path to the selected context
                const pathname = pathContextId
                    ? item
                        ? // context id exists in the url, replace it with the new context id
                          currentPathname.replace(pathContextId, item.id)
                        : // context was cleared, set the path to the root
                          '/'
                    : // could not find context id in the url, set the path to the new context id
                      `/${item?.id}`;

                console.debug(
                    '🌍 Portal:',
                    "context changed, navigating to app's context url:",
                    pathContextId
                        ? `found context id [${pathContextId}] in url, ${item ? `replacing with [${item.id}]` : 'context was cleared, navigating to root'}`
                        : `could not find context id in url, navigating to context id [${item ? item.id : 'root'}]`,
                );

                // if app has its own navigation, use it to navigate
                if (appNavigation) {
                    // update the path of the app navigation, preserving search and hash
                    appNavigation.replace({ ...appNavigation.path, pathname });
                } else {
                    // update the path of the portal navigation, preserving search and hash
                    navigation.replace({ ...navigation.path, pathname });
                }
            },
            [
                // framework navigation instance, should not change
                navigation,
                // application navigation instance, may change when the application changes
                appNavigation,
            ],
        ),
    );
};
