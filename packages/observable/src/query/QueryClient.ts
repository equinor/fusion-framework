import { interval, Observable, ObservableInput, Subject } from 'rxjs';
import { debounce, pluck,  filter, withLatestFrom, map } from 'rxjs/operators';

import { Query } from './Query';

import { QueryCache, QueryCacheState } from './QueryCache';

import { QueryFn, RetryOpt } from './types';

export type QueryOptions<TType, TArgs = unknown> = {
    initial?: TType;
    retry?: RetryOpt;
    debounce?:
        | ((value: TArgs, data: QueryCacheState<TType, TArgs>) => ObservableInput<unknown>)
        | number;
};

export class QueryClient<TType, TArgs> extends Observable<TType> {
    private __client$: Query<TType, TArgs>;
    private __state$: QueryCache<TType, TArgs>;
    private __queries$ = new Subject<TArgs>();

    public get data(): TType | undefined {
        return this.__state$.value.data;
    }

    constructor(queryFn: QueryFn<TType, TArgs>, options?: QueryOptions<TType, TArgs>) {
        super((subscriber) => this.__state$.pipe(pluck('data')).subscribe(subscriber));

        this.__client$ = new Query(queryFn, {
            retry: options?.retry,
        });

        this.__state$ = new QueryCache(this.__client$, options?.initial);

        const debounceFn =
            typeof options?.debounce === 'function'
                ? options.debounce
                : () => interval(Number(options?.debounce));

        this.__queries$
            .pipe(
                withLatestFrom(this.__state$),
                debounce(([value, state]) => debounceFn(value, state)),
                map(([value]) => value),
                filter(() => !this.__client$.closed)
            )
            .subscribe((value) => this.__client$.next(value));
    }

    public refresh() {
        this.next(this.__state$.value.args as TArgs);
    }

    public next(q: TArgs): void {
        this.__queries$.next(q);
    }

    public complete() {
        this.__queries$.complete();
        this.__client$.complete();
        this.__state$.complete();
    }
}
