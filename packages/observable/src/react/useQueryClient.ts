import { useEffect, useMemo, useState } from 'react';
import { Query, QueryClient, QueryFn, QueryOptions, QueryStatus } from '../query';
import { useObservableSelectorState } from './useObservableSelectorState';
import { useObservableState } from './useObservableState';

export const useQueryClient = <TType, TArgs>(
    queryFn: QueryFn<TType, TArgs>,
    options?: QueryOptions<TType, TArgs>
) => {
    const [client] = useState(() => new QueryClient(queryFn, options));
    const data = useObservableState(client);
    const status = useQueryClientStatus(client.query);
    const query = useMemo(() => client.next.bind(client), [client]);

    useEffect(() => () => client.complete(), [client]);
    return { data, status, query };
};

export const useQueryClientStatus = <TType, TArgs>(query: Query<TType, TArgs>): QueryStatus =>
    useObservableSelectorState(query, (state) => state.status) as QueryStatus;

export default useQueryClient;
