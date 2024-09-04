import { ApplicationManifest } from '@equinor/fusion-framework-module-app';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useMemo } from 'react';

import { useAppProvider } from './useAppProvider';

type UseAppsArgs = {
    /** @deprecated - no longer available */
    includeHidden: boolean;
    // only show apps that the current user has access to
    filterByCurrentUser: boolean;
};

/**
 * React Hook - Get apps from framework
 * @param _args Object with boolean  member includeHidden
 * @returns Object {apps, isLoading} where apps is Array of ApplicationManifest, isLoading is a boolean on observable complete
 * @deprecated _args is not used anymore with new app service
 * @since 7.1.1
 */
export const useApps = (
    args?: UseAppsArgs,
): { apps: ApplicationManifest[] | undefined; isLoading: boolean; error: unknown } => {
    const provider = useAppProvider();

    const { filterByCurrentUser } = args || {};

    const {
        value: apps,
        complete,
        error,
    } = useObservableState(
        useMemo(
            () =>
                provider.getAppManifests(filterByCurrentUser ? { filterByCurrentUser } : undefined),
            [provider, filterByCurrentUser],
        ),
    );

    return { apps, isLoading: !complete, error };
};

export default useApps;
