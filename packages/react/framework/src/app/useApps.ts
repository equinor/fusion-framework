import { AppManifest } from '@equinor/fusion-framework-module-app';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useMemo } from 'react';

import { useAppProvider } from './useAppProvider';

/**
 * Get array of apps from framework
 * @param args include hidden apps
 * @returns Array with AppManifest or undefined
 */
export const useApps = (args: {
    includeHidden: boolean;
}): { apps: AppManifest[] | undefined; isLoading: boolean } => {
    const provider = useAppProvider();
    const { next, complete } = useObservableState(
        useMemo(() => provider.getAllAppManifests(), [provider])
    );

    const apps = useMemo(() => {
        if (next && !args.includeHidden) {
            return next.filter((app) => app.hide);
        }
        return next;
    }, [args, next]);

    return { apps, isLoading: !complete };
};

export default useApps;
