import { AppManifest } from '@equinor/fusion-framework-module-app';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useMemo } from 'react';

import { useAppProvider } from './useAppProvider';

/**
 * React Hook - Get apps from framework
 * @param args Object with boolean  member includeHidden
 * @returns Object {apps, isLoading} where apps is Array of AppManifest, isLoading is a boolean on observable complete
 */
export const useApps = (args?: {
    includeHidden: boolean;
}): { apps: AppManifest[] | undefined; isLoading: boolean } => {
    const provider = useAppProvider();
    const { value: manifests, complete } = useObservableState(
        useMemo(() => provider.getAllAppManifests(), [provider]),
    );

    const apps = useMemo(() => {
        if (manifests && !args?.includeHidden) {
            return manifests.filter((app) => !app.hide);
        }
        return manifests;
    }, [args, manifests]);

    return { apps, isLoading: !complete };
};

export default useApps;
