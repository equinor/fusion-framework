import {
    EMPTY,
    firstValueFrom,
    lastValueFrom,
    Observable,
    ReplaySubject,
    Subject,
    Subscription,
} from 'rxjs';
import { catchError, takeWhile } from 'rxjs/operators';

import { v4 as generateGUID, v5 as generateUniqueKey } from 'uuid';

import {
    QueryClient,
    QueryClientCtorOptions,
    QueryClientOptions,
    QueryTaskCompleted,
    QueryTaskValue,
} from './client';

import { QueryCache, QueryCacheRecord } from './cache';

import {
    CacheOptions,
    QueryFn,
    QueryOptions,
    QueryQueueFn,
    QueryQueueItem,
    QueryTaskCached,
} from './types';
import { QueryCacheCtorArgs } from './cache/QueryCache';
import { filterQueryTaskComplete } from './client/operators';
import { concatQueue, mergeQueue, queryValue, switchQueue } from './operators';

export type QueryCtorOptions<TType, TArgs> = {
    client:
        | QueryClient<TType, TArgs>
        | {
              fn: QueryFn<TType, TArgs>;
              options?: QueryClientCtorOptions;
          };
    key: CacheOptions<TType, TArgs>['key'];
    validate?: CacheOptions<TType, TArgs>['validate'];
    cache?: QueryCache<TType, TArgs> | QueryCacheCtorArgs<TType, TArgs>;
    /**
     * cache expire time in ms.
     * This attribute is only used when `validate` function is not provided.
     *
     * If the number is undefined or 0, cache is disabled
     * */
    expire?: number;
    queueOperator?: QueueOperatorType | QueryQueueFn<TArgs, TType>;
};

type QueryKeyBuilder<T> = (args: T) => string;

type CacheValidator<TType, TArgs> = (entry: QueryCacheRecord<TType, TArgs>, args: TArgs) => boolean;

const defaultCacheValidator =
    <TType, TArgs>(expires = 0): CacheValidator<TType, TArgs> =>
    (entry) =>
        (entry.updated ?? 0) + expires > Date.now();

type QueueOperatorType = 'switch' | 'merge' | 'concat';

const useQueueOperator = <TType, TArgs>(
    type?: QueueOperatorType | QueryQueueFn<TArgs, TType>,
): QueryQueueFn<TArgs, TType> => {
    if (typeof type === 'function') {
        return type;
    }
    switch (type) {
        case 'concat':
            return concatQueue;
        case 'merge':
            return mergeQueue;
        case 'switch':
        default:
            return switchQueue;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Query<TType, TArgs = any> {
    static extractQueryValue = queryValue;

    #subscription = new Subscription();
    #client: QueryClient<TType, TArgs>;
    #cache: QueryCache<TType, TArgs>;
    #queryQueue$ = new Subject<QueryQueueItem<TArgs, TType>>();

    #generateCacheKey: QueryKeyBuilder<TArgs>;
    #validateCacheEntry: CacheValidator<TType, TArgs>;

    #namespace = generateGUID();

    public get client(): QueryClient<TType, TArgs> {
        // TODO: Proxy
        return this.#client;
    }

    public get cache(): QueryCache<TType, TArgs> {
        // TODO: Proxy
        return this.#cache;
    }

    constructor(options: QueryCtorOptions<TType, TArgs>) {
        this.#generateCacheKey = (args: TArgs) => {
            return generateUniqueKey(options.key(args), this.#namespace);
        };
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

        const queueOperator = useQueueOperator(options.queueOperator);

        this.#subscription.add(() => this.#queryQueue$.complete());
        this.#subscription.add(
            this.#queryQueue$
                .pipe(
                    queueOperator(
                        ({ args, options }) =>
                            new Observable<QueryTaskValue<TType, TArgs>>((subscriber) => {
                                const { task, transaction } = this.#client.next(args, options);
                                subscriber.add(
                                    // ignore errors, only emit new cache values
                                    task.pipe(catchError(() => EMPTY)).subscribe(subscriber),
                                );
                                subscriber.add(() => {
                                    /** cancel transaction if switched */
                                    setTimeout(() => this.#client.cancel(transaction));
                                });
                            }),
                    ),
                    filterQueryTaskComplete<TType, TArgs>(),
                    takeWhile(() => !this.#client.closed),
                )
                .subscribe((task) => {
                    const { args, value, transaction, ref } = task;
                    const key = ref ?? this.#generateCacheKey(args);
                    this.#cache.setItem(key, {
                        value,
                        args,
                        transaction,
                    });
                }),
        );
    }

    public next(args: TArgs, options?: Partial<QueryClientOptions<TType, TArgs>>) {
        this.#queryQueue$.next({ args, options });
    }

    /**
     * Execute query.
     * Will throw error if query was skipped or canceled
     */
    public query(
        args: TArgs,
        options?: QueryOptions<TType, TArgs>,
    ): Observable<QueryTaskCached<TType, TArgs> | QueryTaskCompleted<TType, TArgs>> {
        const ref = this.#generateCacheKey(args);
        const task = this.#client.getTaskByRef(ref) ?? this._createTask(ref, args, options);
        return task as Observable<QueryTaskCached<TType, TArgs> | QueryTaskCompleted<TType, TArgs>>;
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
        opt?: QueryOptions<TType, TArgs> & { awaitResolve: boolean },
    ): Promise<QueryTaskValue<TType, TArgs>> {
        const { awaitResolve, ...args } = opt || {};
        const fn = awaitResolve ? lastValueFrom : firstValueFrom;
        return fn(this._query(payload, args));
    }

    public complete() {
        this.#subscription.unsubscribe();
    }

    protected _query(
        args: TArgs,
        options?: QueryOptions<TType, TArgs>,
    ): Observable<QueryTaskCached<TType, TArgs> | QueryTaskCompleted<TType, TArgs>> {
        const ref = this.#generateCacheKey(args);
        const task = this.#client.getTaskByRef(ref) ?? this._createTask(ref, args, options);
        return task as Observable<QueryTaskCached<TType, TArgs> | QueryTaskCompleted<TType, TArgs>>;
    }

    protected _createTask(
        ref: string,
        args: TArgs,
        options?: QueryOptions<TType, TArgs>,
    ): Observable<QueryTaskValue<TType, TArgs>> {
        const task = new ReplaySubject<QueryTaskValue<TType, TArgs>>();

        const cacheEntry = this.#cache.getItem(ref);
        if (cacheEntry) {
            const { value, args, created, updated, updates, transaction } = cacheEntry;
            const taskEntry: QueryTaskCached<TType, TArgs> = {
                status: 'cache',
                value,
                args,
                created,
                updated,
                updates,
                transaction,
            };
            task.next(taskEntry);
        }

        const validateCache = options?.cache?.validate || this.#validateCacheEntry;
        const validCacheEntry = cacheEntry && validateCache(cacheEntry, args);

        if (!validCacheEntry) {
            this.#queryQueue$.next({ args, options: { ref, task } });
        } else {
            task.complete();
        }

        return task.asObservable();
    }
}

export default Query;
