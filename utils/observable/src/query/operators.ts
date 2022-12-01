import type { Observable } from 'rxjs';
import { concatMap, map, mergeMap, switchMap } from 'rxjs/operators';

import type { QueryTaskValue } from './client';
import type { Query } from './Query';

import type { QueryQueueItem } from './types';

export const concatQueue =
    <TArgs, TType>(cb: (args: QueryQueueItem<TArgs, TType>) => Observable<QueryTaskValue<TType>>) =>
    (source$: Observable<QueryQueueItem<TArgs, TType>>) =>
        source$.pipe(concatMap(cb));

export const mergeQueue =
    <TArgs, TType>(cb: (args: QueryQueueItem<TArgs, TType>) => Observable<QueryTaskValue<TType>>) =>
    (source$: Observable<QueryQueueItem<TArgs, TType>>) =>
        source$.pipe(mergeMap(cb));

export const switchQueue =
    <TArgs, TType>(cb: (args: QueryQueueItem<TArgs, TType>) => Observable<QueryTaskValue<TType>>) =>
    (source$: Observable<QueryQueueItem<TArgs, TType>>) =>
        source$.pipe(switchMap(cb));

export const queryValue = <TType, TArgs>(
    source$: ReturnType<Query<TType, TArgs>['query']>
): Observable<TType> => source$.pipe(map((entry) => entry.value));
