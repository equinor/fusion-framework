import { useCallback, useEffect, useState } from 'react';

import { useAppModule } from '@equinor/fusion-framework-react-app';
import { ContextModule, QueryContextParameters } from '@equinor/fusion-framework-module-context';
import { useObservableSelectorState } from '@equinor/fusion-observable/react';

const useContextQuery = () => {
    const provider = useAppModule<ContextModule>('context');
    const [result, setResult] = useState<unknown>(null);

    const search = useCallback(
        (args: QueryContextParameters) => {
            provider.queryClient.query(args).subscribe(setResult);
        },
        [provider]
    );

    const status = useObservableSelectorState(provider.queryClient.client, (x) => x.status);

    useEffect(() => {
        provider.queryClient.client.status;
    }, []);

    return { search, result, status };
};

export const QueryContext = () => {
    const [query, setQuery] = useState<string>('');
    const { result, search, status } = useContextQuery();
    useEffect(() => {
        if (query.length > 2) {
            search({ search: query });
        }
    }, [query, search]);
    return (
        <div>
            <input type="search" onChange={(e) => setQuery(e.currentTarget.value)} />
            <span>status: {status}</span>
            <div>
                {status === 'active' && <p>Loading data</p>}
                {status === 'idle' && <pre>{JSON.stringify(result, undefined, 4)}</pre>}
            </div>
        </div>
    );
};

export default QueryContext;
