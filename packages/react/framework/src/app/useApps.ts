import { useObservableState } from '@equinor/fusion-observable/react';
import { useMemo } from 'react';

import { useAppProvider } from './useAppProvider';

export const useApps = (args: { includeHidden: boolean }) => {
    const provider = useAppProvider();

    const apps = useObservableState(useMemo(() => provider.getAllAppManifests(), [provider]));

    return useMemo(() => {
        if (apps && !args.includeHidden) {
            return apps.filter((app) => app.hide);
        }
        return apps;
    }, [args, apps]);
};

export default useApps;
