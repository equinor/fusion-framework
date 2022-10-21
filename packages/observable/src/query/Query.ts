import {
    firstValueFrom,
    interval,
    lastValueFrom,
    merge,
    Observable,
    ObservableInput,
    race,
    Subject,
    Subscription,
} from 'rxjs';
import { debounce, filter, withLatestFrom, map, take } from 'rxjs/operators';

import { v4 as uuid } from 'uuid';

import { filterAction } from '../operators';

import { QueryClient, QueryClientCtorOptions, QueryClientOptions } from './client';

import { QueryCache, QueryCacheRecord, QueryCacheState, QueryCacheStateData } from './cache';

import { QueryFn } from './types';
import { QueryCacheCtorArgs } from './cache/QueryCache';

// import { ActionTypes, SkipAction } from './actions';

type CacheOptions<TType, TArgs> = {
    key: (query: TArgs) => string;
    validate: CacheValidator<TType, TArgs>;
};

type Debounce<TType, TArgs = unknown> =
    | ((value: TArgs, data: QueryCacheState<TType, TArgs>) => ObservableInput<unknown>)
    | number;

export type QueryOptions<TType, TArgs = unknown> = {
    client?: Partial<QueryClientOptions>;
    cache?: Partial<CacheOptions<TType, TArgs>>;
};

export type QueryCtorOptions<TType, TArgs> = {
    client:
        | QueryClient<TType, TArgs>
        | {
              fn: QueryFn<TType, TArgs>;
              options?: QueryClientCtorOptions;
          };
    key: CacheOptions<TType, TArgs>['key'];
    validate?: CacheOptions<TType, TArgs>['validate'];
    // initial?: QueryCacheStateData<TType, TArgs>;
    cache?: QueryCache<TType, TArgs> | QueryCacheCtorArgs<TType, TArgs>;
    /**
     * cache expire time in ms.
     * This attribute is only used when `validate` function is not provided.
     *
     * If the number is undefined or 0, cache is disabled
     * */
    expire?: number;
    debounce?: Debounce<TType, TArgs>;
};

type QueryKeyBuilder<T> = (args: T) => string;

type CacheValidator<TType, TArgs> = (entry: QueryCacheRecord<TType, TArgs>, args: TArgs) => boolean;

const defaultCacheValidator =
    <TType, TArgs>(expires = 0): CacheValidator<TType, TArgs> =>
    (entry) =>
        (entry.updated ?? 0) + expires > Date.now();

export class Query<TType, TArgs> extends Observable<QueryCacheStateData<TType, TArgs>> {
    #subscription = new Subscription();
    #client: QueryClient<TType, TArgs>;
    #cache: QueryCache<TType, TArgs>;
    #queryQueue$ = new Subject<{
        args: TArgs;
        options?: Partial<QueryClientOptions>;
    }>();

    #generateCacheKey: QueryKeyBuilder<TArgs>;
    #validateCacheEntry: CacheValidator<TType, TArgs>;

    public get client(): QueryClient<TType, TArgs> {
        return this.#client;
    }

    public get state$(): QueryCache<TType, TArgs> {
        return this.#cache;
    }

    constructor(options: QueryCtorOptions<TType, TArgs>) {
        super((subscriber) => this.#cache.pipe(map(({ data }) => data)).subscribe(subscriber));

        this.#generateCacheKey = options.key;
        this.#validateCacheEntry =
            options?.validate ?? defaultCacheValidator<TType, TArgs>(options?.expire);

        if (options.client instanceof QueryClient) {
            this.#client = options.client;
        } else {
            this.#client = new QueryClient(options.client.fn, options.client.options);
            this.#subscription.add(() => this.#client.complete());
        }

        if (options.cache instanceof QueryCache) {
            this.#cache = options.cache;
        } else {
            this.#cache = new QueryCache(options.cache || {});
            this.#subscription.add(() => this.#cache.complete());
        }

        this.#subscription.add(
            this.#client.on('success', (action) => {
                const {
                    payload: value,
                    meta: { request },
                } = action;
                const key = this.#generateCacheKey(request.payload);
                this.#cache.setItem(key, {
                    value,
                    args: request.payload,
                    transaction: request.meta.transaction,
                });
            })
        );

        this.#subscription.add(() => this.#queryQueue$.complete());
        this.#subscription.add(
            this.#queryQueue$
                .pipe(
                    withLatestFrom(this.#cache),
                    debounce(([query, state]) => {
                        return typeof options?.debounce === 'function'
                            ? options?.debounce(query.args, state)
                            : interval(Number(options?.debounce));
                    }),
                    map(([value]) => value),
                    filter(() => !this.#client.closed)
                )
                .subscribe(({ args, options }) => this.#client.next(args, options))
        );
    }

    public next(args: TArgs, options?: Partial<QueryClientOptions>) {
        this.#queryQueue$.next({ args, options });
    }

    /**
     * Execute query.
     * Will throw error if query was skipped or canceled
     */
    public query(
        args: TArgs,
        options?: QueryOptions<TType, TArgs>
    ): Observable<QueryCacheRecord<TType, TArgs>> {
        const cacheKey = (options?.cache?.key ?? this.#generateCacheKey)(args);
        const validateCache = options?.cache?.validate || this.#validateCacheEntry;
        const cacheEntry = this.#cache.getItem(cacheKey);

        const refresh = !cacheEntry || !validateCache(cacheEntry, args);

        const clientOptions: Partial<QueryClientOptions> = {
            transaction: uuid(),
            ...options?.client,
        };

        if (refresh) {
            this.next(args, clientOptions);
        }

        /** signal for canceled requests */
        const cancel$ = this.#client.action$.pipe(
            filterAction('cancel'),
            filter((x) => x.meta.request?.meta.transaction === clientOptions.transaction)
        );

        /** signal for skipped request requests, normally triggered by new query before resolving current or debounced */
        const skipped$ = this.#queryQueue$.pipe(
            map((next) => ({
                type: 'skipped',
                payload: args,
                meta: { options, next },
            }))
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

        const complete$ = this.#cache.action$.pipe(
            filterAction('set'),
            filter((action) => action.payload.value.transaction === clientOptions.transaction),
            map((action) => action.payload.value),
            take(1)
        );

        return new Observable((observer) => {
            cacheEntry && observer.next(cacheEntry);
            if (refresh) {
                race(complete$, reject$).subscribe(observer);
            } else {
                observer.complete();
            }
        });
    }

    /**
     * Execute async query
     *
     * @param awaitResolve - when true, wait until query executed
     *
     * @returns - resolves requests, rejects Error with cause SkipAction|CancelAction
     */
    public queryAsync(
        payload: TArgs,
        opt?: QueryOptions<TType, TArgs> & { awaitResolve: false }
    ): Promise<QueryCacheRecord<TType, TArgs>> {
        const { awaitResolve, ...args } = opt || {};
        const fn = awaitResolve ? lastValueFrom : firstValueFrom;
        return fn(this.query(payload, args));
    }

    public complete() {
        this.#subscription.unsubscribe();
    }
}

export default Query;
