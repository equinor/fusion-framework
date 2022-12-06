import { useAppModule } from '@equinor/fusion-framework-react-app';
import { ContextModule } from '@equinor/fusion-framework-module-context';
import { useDebounceQuery } from '@equinor/fusion-query/react';
import { useObservableState } from '@equinor/fusion-observable/react';

import { useModuleQueryContext } from '@equinor/fusion-framework-react-module-context';

export const QueryContext = () => {
    // const provider = useAppModule<ContextModule>('context');
    const { query, querying, value } = useModuleQueryContext({ debounce: 1000 });
    // const { value$, next } = useDebounceQuery(provider.queryClient, { debounce: 500 });
    // const value = useObservableState(value$);
    return (
        <div>
            <input type="search" onChange={(e) => query(e.currentTarget.value)} />
            <span>{querying ? 'working' : 'idle'}</span>
            <div>
                <pre>{JSON.stringify(value || {}, undefined, 4)}</pre>
            </div>
        </div>
    );
};

export default QueryContext;
