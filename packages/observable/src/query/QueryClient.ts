import { firstValueFrom, interval, merge, Observable, ObservableInput, race, Subject } from 'rxjs';
import { debounce, filter, withLatestFrom, map } from 'rxjs/operators';

import { v4 as uuid } from 'uuid';

import { Query, QueryOptions } from './Query';

import { QueryCache, QueryCacheState } from './QueryCache';

import { QueryFn } from './types';

import { ActionType, SkipAction } from './actions';
import { filterAction } from '../operators';

export type QueryClientOptions<TType, TArgs = unknown> = Partial<QueryOptions> & {
    debounce?:
        | ((value: TArgs, data: QueryCacheState<TType, TArgs>) => ObservableInput<unknown>)
        | number;
};

export type QueryClientCtorOptions<TType, TArgs> = QueryClientOptions<TType, TArgs> & {
    initial?: TType;
};

export class QueryClient<TType, TArgs> extends Observable<TType> {
    private __client$: Query<TType, TArgs>;
    private __state$: QueryCache<TType, TArgs>;
    private __queries$ = new Subject<{
        args: TArgs;
        options?: QueryClientOptions<TType, TArgs>;
    }>();

    /** Current data hold in state */
    public get data(): TType | undefined {
        return this.__state$.value.data;
    }

    public get client(): Query<TType, TArgs> {
        return this.__client$;
    }

    public get state$(): QueryCache<TType, TArgs> {
        return this.__state$;
    }

    constructor(queryFn: QueryFn<TType, TArgs>, options?: QueryClientCtorOptions<TType, TArgs>) {
        super((subscriber) => this.__state$.pipe(map((x) => x.data)).subscribe(subscriber));

        this.__client$ = new Query(queryFn, {
            retry: options?.retry,
        });

        this.__state$ = new QueryCache(this.__client$, options?.initial);

        this.__queries$
            .pipe(
                withLatestFrom(this.__state$),
                debounce(([query, state]) => {
                    const debounce = query.options?.debounce ?? options?.debounce;
                    return typeof debounce === 'function'
                        ? debounce(query.args, state)
                        : interval(Number(debounce));
                }),
                map(([value]) => value),
                filter(() => !this.__client$.closed)
            )
            .subscribe(({ args, options }) => this.__client$.next(args, options));
    }

    public refresh() {
        this.next(this.__state$.value.args as TArgs);
    }

    public next(args: TArgs, options?: QueryClientOptions<TType, TArgs>): void {
        this.__queries$.next({ args, options });
    }

    /**
     * Execute query.
     * Will throw error if query was skipped or canceled
     */
    public query$(
        payload: TArgs,
        opt?: QueryClientOptions<TType, TArgs>
    ): Observable<QueryCacheState<TType, TArgs>> {
        const options: QueryClientOptions<TType, TArgs> = { ref: uuid(), ...opt };

        /** signal for completed request */
        const complete$ = this.__state$.pipe(filter((x) => x.ref === options.ref));

        /** signal for skipped request requests, normally triggered by new query before resolving current or debounced */
        const skipped$ = this.__queries$.pipe(
            filter((x) => x.options?.ref !== options.ref),
            map(
                (next): SkipAction<TArgs> => ({
                    type: ActionType.SKIPPED,
                    payload,
                    meta: { options, next },
                })
            )
        );

        /** signal for canceled requests */
        const cancel$ = this.__client$.action$.pipe(
            filterAction(ActionType.CANCEL),
            filter((x) => x.meta.request?.meta.ref === options.ref)
        );

        /**
         * signal for failed query
         * TODO - add timeout
         */
        const reject$ = merge(skipped$, cancel$).pipe(
            map((cause) => {
                throw new Error('query was canceled', { cause });
            })
        );

        /** dispatch the query */
        this.next(payload, options);
        return race(complete$, reject$);
    }

    /**
     * Execute async query
     * @returns - resolves requests, rejects Error with cause SkipAction|CancelAction
     */
    public query(payload: TArgs, opt?: QueryClientOptions<TType, TArgs>) {
        return firstValueFrom(this.query$(payload, opt));
    }

    public complete() {
        this.__queries$.complete();
        this.__client$.complete();
        this.__state$.complete();
    }
}
