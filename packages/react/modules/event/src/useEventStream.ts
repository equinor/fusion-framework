import { useMemo } from 'react';

import type { Observable, OperatorFunction } from 'rxjs';

import { FrameworkEventMap, filterEvent } from '@equinor/fusion-framework-module-event';
import { useEventProvider } from './EventProvider';

export type EventStream<TKey extends keyof FrameworkEventMap = keyof FrameworkEventMap> =
    Observable<FrameworkEventMap[TKey]>;

/**
 * Hook for observing events
 *
 * @param key name of the event to filter out
 * @param operator [optional] {@link OperatorFunction} for transforming the stream __must be memorized!__
 */
export const useEventStream = <
    TKey extends keyof FrameworkEventMap = keyof FrameworkEventMap,
    TData = FrameworkEventMap[TKey],
>(
    key: TKey,
    operator?: OperatorFunction<FrameworkEventMap[TKey], TData>,
): Observable<TData> => {
    const provider = useEventProvider();
    return useMemo(() => {
        return provider.event$.pipe(filterEvent(key), operator ?? ((x) => x as Observable<TData>));
    }, [provider, key, operator]);
};

export default useEventStream;
