import { useEffect, useMemo, useState } from 'react';
import { share, Subject } from 'rxjs';
import { QueryClient, QueryFn, QueryOptions } from '../query';
import { useObservableSelector } from './useObservableSelector';
import { useObservableState } from './useObservableState';

export const useQueryClient$ = <TType, TArgs>(
    queryFn: QueryFn<TType, TArgs>,
    options?: QueryOptions<TType, TArgs>
) => {
    const [client] = useState(() => new QueryClient(queryFn, options));

    /** make the client data an observable */
    const data$ = client.pipe(share({ connector: () => new Subject() }));

    /** extract status from client state */
    const status$ = useObservableSelector(client.query, (state) => state.status);

    /** map query fn to next client arg and bind instance to client */
    const query = useMemo(() => client.next.bind(client), [client]);

    /** when hook unmounts, dispose the client */
    useEffect(() => () => client.complete(), [client]);

    return { client, data$, status$, query };
};

export const useQueryClient = <TType, TArgs>(
    queryFn: QueryFn<TType, TArgs>,
    options?: QueryOptions<TType, TArgs>
) => {
    const { data$, status$, ...obj } = useQueryClient$(queryFn, options);
    const data = useObservableState(data$);
    const status = useObservableState(status$);
    return { ...obj, data, status };
};

export default useQueryClient;
