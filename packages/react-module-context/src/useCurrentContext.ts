import { ContextItem, ContextModule } from '@equinor/fusion-framework-module-context';
import { IContextProvider, contextModuleKey } from '@equinor/fusion-framework-module-context';
import { useModule } from '@equinor/fusion-framework-react-module';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useCallback } from 'react';

export const useCurrentContext = (provider: IContextProvider) => {
    const currentContext = useObservableState(provider.currentContext$);
    const setCurrentContext = useCallback(
        (entry: ContextItem) => {
            provider.currentContext = entry;
        },
        [provider]
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
