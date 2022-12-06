import {
    ContextModule,
    contextModuleKey,
    IContextProvider,
} from '@equinor/fusion-framework-module-context';
import { useModule } from '@equinor/fusion-framework-react-module';
import { useObservableState, useDebounce } from '@equinor/fusion-observable/react';
import { useMemo } from 'react';

export const useQueryContext = (provider: IContextProvider, options?: { debounce?: number }) => {
    const args = Object.assign({}, { debounce: 500 }, options);
    const searchFn = useMemo(() => provider.queryContext.bind(provider), [provider]);
    const { idle, next, value$ } = useDebounce(searchFn, args);
    const value = useObservableState(value$);
    return { value, querying: !idle, query: next };
};

export const useModuleQueryContext = (options?: { debounce?: number }) => {
    const provider = useModule<ContextModule>(contextModuleKey);
    return useQueryContext(provider, options);
};
