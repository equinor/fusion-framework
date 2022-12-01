import {
    ContextModule,
    contextModuleKey,
    IContextProvider,
} from '@equinor/fusion-framework-module-context';
import { useModule } from '@equinor/fusion-framework-react-module';
import { useDebounceQuery } from '@equinor/fusion-query/react';

export const useQueryContext = (provider: IContextProvider, options?: { debounce?: number }) => {
    const args = Object.assign({}, { debounce: 500 }, options);
    return useDebounceQuery(provider.queryClient, args);
};

export const useModuleQueryContext = (options?: { debounce?: number }) => {
    const provider = useModule<ContextModule>(contextModuleKey);
    return useQueryContext(provider, options);
};
