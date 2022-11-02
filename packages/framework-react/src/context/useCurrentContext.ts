import { ContextItem } from '@equinor/fusion-framework-module-context';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useCallback } from 'react';
import { useFramework } from '../useFramework';

export const useCurrentContext = () => {
    const framework = useFramework();
    const { context } = framework.modules;
    const currentContext = useObservableState(context.currentContext$);
    const setCurrentContext = useCallback(
        (entry: ContextItem) => {
            context.currentContext = entry;
        },
        [context]
    );
    return { currentContext, setCurrentContext };
};

export default useCurrentContext;
