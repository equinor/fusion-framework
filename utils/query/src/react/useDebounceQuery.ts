import { useState } from 'react';
import { useDebounce, UseDebounceOptions } from '@equinor/fusion-observable/react';
import Query, { QueryCtorOptions } from '../Query';

export const useDebounceQuery = <TType, TArgs>(
    clientOrClientCtor: Query<TType, TArgs> | QueryCtorOptions<TType, TArgs>,
    options: UseDebounceOptions<[TArgs]>
) => {
    const [client] = useState<Query<TType, TArgs>>(() =>
        clientOrClientCtor instanceof Query ? clientOrClientCtor : new Query(clientOrClientCtor)
    );

    return useDebounce(client.query.bind(client), options);
};

export default useDebounceQuery;
