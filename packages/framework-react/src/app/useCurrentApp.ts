import { App } from '@equinor/fusion-framework-module-app';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useCallback } from 'react';

import { useFramework } from '../useFramework';

export const useCurrentApp = (): {
    currentApp: App | undefined;
    setCurrentApp: (appKey: string) => void;
} => {
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
