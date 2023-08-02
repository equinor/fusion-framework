import { useState } from 'react';
import { useDebounce, UseDebounceOptions } from '@equinor/fusion-observable/react';
import Query, { QueryCtorOptions } from '../Query';

export const useDebounceQuery = <TType, TArgs>(
    clientOrClientCtor: Query<TType, TArgs> | QueryCtorOptions<TType, TArgs>,
    options: UseDebounceOptions<[TArgs]>,
) => {
    const [query] = useState<Query<TType, TArgs>['query']>(() => {
        const client =
            clientOrClientCtor instanceof Query
                ? clientOrClientCtor
                : new Query(clientOrClientCtor);
        return client.query.bind(client);
    });

    return useDebounce(query, options);
};

export default useDebounceQuery;
