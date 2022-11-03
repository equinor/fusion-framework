import { useObservableState } from '@equinor/fusion-observable/react';
import { useCallback } from 'react';

import { useFramework } from '../useFramework';

export const useCurrentApp = () => {
    const provider = useFramework().modules.app;
    const currentApp = useObservableState(provider.current$);
    const setCurrentApp = useCallback(
        (appKey: string) => provider.setCurrentApp(appKey),
        [provider]
    );
    return {
        currentApp,
        setCurrentApp,
    };
};

export default useCurrentApp;
