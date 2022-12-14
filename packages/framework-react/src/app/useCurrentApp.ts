import { App, AppModule } from '@equinor/fusion-framework-module-app';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useCallback } from 'react';

import { useFramework } from '../useFramework';

export const useCurrentApp = (): {
    currentApp: App | undefined;
    setCurrentApp: (appKey: string) => void;
} => {
    const provider = useFramework<[AppModule]>().modules.app;
    if (!provider) {
        throw Error('Current framework does not have AppModule configured');
    }
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
