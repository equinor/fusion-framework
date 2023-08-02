import { ContextItem, ContextModule } from '@equinor/fusion-framework-module-context';
import { IContextProvider, contextModuleKey } from '@equinor/fusion-framework-module-context';
import { useModule } from '@equinor/fusion-framework-react-module';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useCallback, useMemo } from 'react';

export const useCurrentContext = (provider: IContextProvider) => {
    const currentContext$ = useMemo(() => provider.currentContext$, [provider]);
    const { value: currentContext } = useObservableState(currentContext$, {
        initial: provider.currentContext,
    });
    const setCurrentContext = useCallback(
        (entry?: ContextItem | string | null) => {
            if (!entry) {
                return provider.clearCurrentContext();
            } else if (typeof entry === 'string') {
                return provider.setCurrentContextByIdAsync(entry);
            }
            return provider.setCurrentContextAsync(entry);
        },
        [provider],
    );
    return { currentContext, setCurrentContext };
};

/**
 * uses context provider from closes module provider
 */
export const useModuleCurrentContext = () => {
    const provider = useModule<ContextModule>(contextModuleKey);
    return useCurrentContext(provider);
};

export default useModuleCurrentContext;
