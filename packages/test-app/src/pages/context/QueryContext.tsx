import { useAppModule } from '@equinor/fusion-framework-react-app';
import { ContextModule } from '@equinor/fusion-framework-module-context';
import { useDebounceQuery } from '@equinor/fusion-observable/react';

export const QueryContext = () => {
    const provider = useAppModule<ContextModule>('context');
    const { value, query } = useDebounceQuery(provider.queryClient, { debounce: 500 });
    return (
        <div>
            <input
                type="search"
                onChange={(e) => query({ args: { search: e.currentTarget.value } })}
            />
            <div>
                <pre>{JSON.stringify(value, undefined, 4)}</pre>
            </div>
        </div>
    );
};

export default QueryContext;
