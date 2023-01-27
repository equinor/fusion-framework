import { AppModule, CurrentApp } from '@equinor/fusion-framework-module-app';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useMemo } from 'react';

import { useFramework } from '../useFramework';

export const useCurrentApp = (): {
    currentApp: CurrentApp;
    setCurrentApp: (appKey: string) => void;
    clearCurrentApp: () => void;
} => {
    const provider = useFramework<[AppModule]>().modules.app;
    if (!provider) {
        throw Error('Current framework does not have AppModule configured');
    }
    const { next: currentApp } = useObservableState(provider.current$);
    return {
        currentApp,
        setCurrentApp: useMemo(() => provider.setCurrentApp.bind(provider), [provider]),
        clearCurrentApp: useMemo(() => provider.clearCurrentApp.bind(provider), [provider]),
    };
};

export default useCurrentApp;
