import { useCallback, useMemo, useState } from 'react';
import { debounce, debounceTime, ObservableInput, Subject, switchMap } from 'rxjs';
import { useObservableState } from './useObservableState';
import type { ObservableType } from '../types';
import Query, { QueryCtorOptions } from '../query/Query';
import { QueryOptions } from '../query/types';

type UseDebounceQueryArgs<TType, TArgs> = { args: TArgs; options?: QueryOptions<TType, TArgs> };
type UseDebounceQueryValue<TType, TArgs> = ObservableType<ReturnType<Query<TType, TArgs>['query']>>;

export const useDebounceQuery = <TType, TArgs>(
    clientOrClientCtor: Query<TType, TArgs> | QueryCtorOptions<TType, TArgs>,
    options: {
        debounce:
            | ((value: UseDebounceQueryArgs<TType, TArgs>) => ObservableInput<unknown>)
            | number;
        initial?: ObservableType<ReturnType<Query<TType, TArgs>['query']>>;
        queuer?: Subject<UseDebounceQueryArgs<TType, TArgs>>;
    }
): {
    value: UseDebounceQueryValue<TType, TArgs> | undefined;
    query: (args: UseDebounceQueryArgs<TType, TArgs>) => void;
} => {
    const [client] = useState<Query<TType, TArgs>>(() =>
        clientOrClientCtor instanceof Query ? clientOrClientCtor : new Query(clientOrClientCtor)
    );
    const [queuer] = useState(
        () => options?.queuer ?? new Subject<UseDebounceQueryArgs<TType, TArgs>>()
    );

    const query = useCallback(
        (args: UseDebounceQueryArgs<TType, TArgs>) => queuer.next(args),
        [queuer]
    );

    const debounceFn = useMemo(
        () =>
            typeof options.debounce === 'function'
                ? debounce(options.debounce)
                : debounceTime<UseDebounceQueryArgs<TType, TArgs>>(options.debounce),
        [options.debounce]
    );

    const value = useObservableState(
        useMemo(
            () =>
                queuer.pipe(
                    debounceFn,
                    switchMap(({ args, options }) => client.query(args, options))
                ),
            [client]
        ),
        options?.initial
    );

    return { value, query };
};

export default useDebounceQuery;
