import { useEffect, useMemo, useState } from 'react';
import { Observable, share, Subject } from 'rxjs';
import { QueryClient, QueryFn, QueryOptions, QueryStatus } from '../query';
import { useObservableSelector } from './useObservableSelector';
import { useObservableState } from './useObservableState';

export type UseQueryClientStreamResult<TType, TArgs> = {
    client: QueryClient<TType, TArgs>;
    data$: Observable<TType>;
    status$: Observable<QueryStatus>;
    query: (args: TArgs) => void;
};

export type UseQueryClientResult<TType, TArgs> = Omit<
    UseQueryClientStreamResult<TType, TArgs>,
    'data$' | 'status$'
> & {
    data: TType | undefined;
    status: QueryStatus;
    isLoading: boolean;
};

/**
 * Hook for using Observable Query
 * @param queryFn function for execute query
 * @param options optional args for `QueryClient`
 */
export const useQueryClient$ = <TType, TArgs>(
    queryFn: QueryFn<TType, TArgs>,
    options?: QueryOptions<TType, TArgs>
): UseQueryClientStreamResult<TType, TArgs> => {
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

/**
 * Convert observables from `useQueryClient$`
 */
export const useQueryClientStreamResult = <
    TType,
    TArgs extends {
        data$: Observable<TType>;
        status$: Observable<QueryStatus>;
    }
>(
    result: TArgs
): {
    data: TType | undefined;
    status: QueryStatus;
    isLoading: boolean;
} & Omit<TArgs, 'data$' | '$status'> => {
    const { data$, status$, ...obj } = result;
    const data = useObservableState(data$);
    const status = useObservableState(status$) ?? QueryStatus.IDLE;
    const isLoading = useMemo(() => status === QueryStatus.ACTIVE, [status]);
    return Object.assign(obj as Omit<TArgs, 'data$' | '$status'>, { data, status, isLoading });
};

export const useQueryClient = <TType, TArgs>(
    queryFn: QueryFn<TType, TArgs>,
    options?: QueryOptions<TType, TArgs>
): UseQueryClientResult<TType, TArgs> =>
    useQueryClientStreamResult(useQueryClient$(queryFn, options));

export default useQueryClient;
