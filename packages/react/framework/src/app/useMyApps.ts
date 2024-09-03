import { ApplicationManifest } from '@equinor/fusion-framework-module-app';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useMemo } from 'react';

import { useAppProvider } from './useAppProvider';

/**
 * React Hook - Get apps where curent user have access
 * @returns Object {apps, isLoading} where apps is Array of ApplicationManifest, isLoading is a boolean on observable complete
 */
export const useMyApps = (): {
    apps: ApplicationManifest[] | undefined;
    isLoading: boolean;
    error: unknown;
} => {
    const provider = useAppProvider();
    const {
        value: apps,
        complete,
        error,
    } = useObservableState(useMemo(() => provider.getMyAppManifests(), [provider]));

    return { apps, isLoading: !complete, error };
};

export default useMyApps;