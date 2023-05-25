import { useMemo } from 'react';

import { useObservableState } from '@equinor/fusion-observable/react';

import { type AnyModule } from '@equinor/fusion-framework-module';
import { type AppModule, type CurrentApp } from '@equinor/fusion-framework-module-app';

import { useFramework } from '../useFramework';

/**
 * Observers the stream of current app and return the latest application
 *
 * __Warning:__ type hint templates are only hints, this does not check if the modules are actually enabled!
 *
 * @template TModule type hint modules which the application has configured
 * @template TEnv type hint what kind of environment config the application has
 */
export const useCurrentApp = <TModules extends Array<AnyModule> = [], TEnv = unknown>(): {
    currentApp: CurrentApp<TModules, TEnv>;
    setCurrentApp: (appKey: string) => void;
    clearCurrentApp: () => void;
    error?: unknown;
} => {
    const provider = useFramework<[AppModule]>().modules.app;
    if (!provider) {
        throw Error('Current framework does not have AppModule configured');
    }
    const currentApp$ = useMemo(() => provider.current$, [provider]);
    const { value, error } = useObservableState(currentApp$);
    return {
        currentApp: value as CurrentApp<TModules, TEnv>,
        setCurrentApp: useMemo(() => provider.setCurrentApp.bind(provider), [provider]),
        clearCurrentApp: useMemo(() => provider.clearCurrentApp.bind(provider), [provider]),
        error,
    };
};

export default useCurrentApp;
