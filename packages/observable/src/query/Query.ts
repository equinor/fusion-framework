import { firstValueFrom, interval, merge, Observable, ObservableInput, race, Subject } from 'rxjs';
import { debounce, filter, withLatestFrom, map } from 'rxjs/operators';

import { v4 as uuid } from 'uuid';

import { filterAction } from '../operators';

import { QueryClient, QueryClientCtorOptions, QueryClientOptions } from './client';

import { QueryCache, QueryCacheRecord, QueryCacheState, QueryCacheStateData } from './cache';

import { QueryFn } from './types';

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
    key: CacheOptions<TType, TArgs>['key'];
    validate?: CacheOptions<TType, TArgs>['validate'];
    client?: QueryClientCtorOptions;
    initial?: QueryCacheStateData<TType, TArgs>;
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
        (entry.created ?? 0) + expires < Date.now();

export class Query<TType, TArgs> extends Observable<QueryCacheStateData<TType, TArgs>> {
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

    constructor(queryFn: QueryFn<TType, TArgs>, options: QueryCtorOptions<TType, TArgs>) {
        super((subscriber) => this.#cache.pipe(map(({ data }) => data)).subscribe(subscriber));

        this.#generateCacheKey = options.key;
        this.#validateCacheEntry =
            options?.validate ?? defaultCacheValidator<TType, TArgs>(options?.expire);

        this.#client = new QueryClient(queryFn, options.client);

        this.#cache = new QueryCache(this.#client, {
            KeyBuilder: this.#generateCacheKey,
            initial: options?.initial,
        });

        const debounceCb = options?.debounce;

        this.#queryQueue$
            .pipe(
                withLatestFrom(this.#cache),
                debounce(([query, state]) => {
                    return typeof debounceCb === 'function'
                        ? debounceCb(query.args, state)
                        : interval(Number(debounceCb));
                }),
                map(([value]) => value),
                filter(() => !this.#client.closed)
            )
            .subscribe(({ args, options }) => this.#client.next(args, options));
    }

    public next(args: TArgs, options?: Partial<QueryClientOptions>) {
        this.#queryQueue$.next({ args, options });
    }

    /**
     * Execute query.
     * Will throw error if query was skipped or canceled
     */
    public query$(args: TArgs, options?: QueryOptions<TType, TArgs>) {
        const result$ = new Subject();

        const cacheKey = (options?.cache?.key ?? this.#generateCacheKey)(args);
        const validateCache = options?.cache?.validate || this.#validateCacheEntry;
        const cacheEntry = this.#cache.getItem(cacheKey);

        const refresh = !cacheEntry || !validateCache(cacheEntry, args);

        if (cacheEntry) {
            result$.next(cacheEntry);
            if (!refresh) {
                return result$;
            }
        }

        const clientOptions: Partial<QueryClientOptions> = {
            ref: uuid(),
            ...options?.client,
        };

        this.next(args, clientOptions);

        /** signal for completed request */
        const complete$ = this.#cache.action$.pipe(
            filterAction('set'),
            filter((action) => action.payload.value.ref === clientOptions.ref),
            map((action) => action.payload.value)
        );

        /** signal for canceled requests */
        const cancel$ = this.#client.action$.pipe(
            filterAction('cancel'),
            filter((x) => x.meta.request?.meta.ref === clientOptions.ref)
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

        race(complete$, reject$).subscribe(result$);

        return result$.asObservable();
    }

    /**
     * Execute async query
     * @returns - resolves requests, rejects Error with cause SkipAction|CancelAction
     */
    public query(payload: TArgs, opt?: QueryOptions<TType, TArgs>) {
        return firstValueFrom(this.query$(payload, opt));
    }

    public complete() {
        this.#queryQueue$.complete();
        this.#client.complete();
        this.#cache.complete();
    }
}

export default Query;
