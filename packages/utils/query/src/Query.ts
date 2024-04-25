import {
    EMPTY,
    firstValueFrom,
    fromEvent,
    interval,
    lastValueFrom,
    Observable,
    Subject,
    Subscription,
} from 'rxjs';
import { catchError, filter, map, takeWhile, tap, throwIfEmpty } from 'rxjs/operators';

import { v4 as generateGUID, v5 as generateUniqueKey } from 'uuid';

import { QueryClient, QueryClientCtorOptions } from './client';

import { QueryCache, QueryCacheMutation, QueryCacheRecord } from './cache';

import {
    CacheOptions,
    QueryFn,
    QueryOptions,
    QueryQueueFn,
    QueryQueueResult,
    QueryTaskCached,
    QueryTaskCompleted,
} from './types';
import { QueryCacheCtorArgs } from './cache/QueryCache';
import { concatQueue, mergeQueue, queryValue, switchQueue } from './operators';

import { filterAction } from '@equinor/fusion-observable/operators';
import { ConsoleLogger, ILogger } from './logger';
import { QueryTask } from './QueryTask';

/**
 * Defines the constructor options for a Query object.
 *
 * @typeParam TType - The type of the data returned by the query.
 * @typeParam TArgs - The type of the arguments passed to the query function.
 */
export type QueryCtorOptions<TType, TArgs> = {
    /**
     * The client instance or configuration to be used for fetching data.
     * It can either be an instance of QueryClient or an object with a 'fn' property
     * that is a query function and an optional 'options' object for additional QueryClient options.
     */
    client:
        | QueryClient<TType, TArgs>
        | {
              fn: QueryFn<TType, TArgs>;
              options?: QueryClientCtorOptions;
          };
    /**
     * A function that generates a unique key for caching query results based on the arguments.
     * This key is used to store and retrieve cache entries.
     */
    key: CacheOptions<TType, TArgs>['key'];
    /**
     * An optional function to validate cache entries. It receives a cache entry and the arguments
     * and returns a boolean indicating whether the cache entry is still valid.
     */
    validate?: CacheOptions<TType, TArgs>['validate'];
    /**
     * An optional instance of QueryCache or constructor arguments for creating a new QueryCache instance.
     * If not provided, a new QueryCache will be created with default options.
     */
    cache?: QueryCache<TType, TArgs> | QueryCacheCtorArgs<TType, TArgs>;
    /**
     * The expiration time of the cache in milliseconds.
     * If undefined or 0, caching is disabled.
     * This attribute is used only when the 'validate' function is not provided.
     */
    expire?: number;
    /**
     * Queue strategies determine how multiple concurrent query requests are handled.
     *
     * - 'switch': This strategy cancels the current active request when a new request comes in.
     *   Only the result from the latest request will be returned. This is useful when only the latest data is relevant.
     *
     * - 'merge': With this strategy, multiple requests can run in parallel without canceling each other.
     *   All responses will be returned as they arrive. This is useful when all requests need to be resolved,
     *   regardless of the order in which they were initiated.
     *
     * - 'concat': This strategy queues requests and executes them one after another in a sequential manner.
     *   A new request will only start after the previous one has completed. This is useful when the order of
     *   execution is important and each request must be completed before the next begins.
     */
    queueOperator?: QueueOperatorType | QueryQueueFn<TType, TArgs>;

    /**
     * An optional logger instance for logging events and operations within the Query class.
     * If not provided, a ConsoleLogger will be used with default settings.
     */
    logger?: ILogger;
};

/**
 * A type alias for a function that builds a query key from the given arguments.
 * This function is responsible for generating a unique string key that represents the query arguments.
 * This key is used to cache and retrieve results, ensuring that each set of arguments has a distinct cache entry.
 *
 * @typeParam T - The type of the arguments used to build the query key.
 */
type QueryKeyBuilder<T> = (args: T) => string;

/**
 * A type alias for a function that validates a cache entry.
 * This function is responsible for determining whether a cache entry is still valid.
 * It receives the cache entry and the arguments that were used to create it, and returns a boolean
 * indicating whether the cache entry can be used or should be considered stale and discarded.
 *
 * @typeParam TType - The type of the data in the cache entry.
 * @typeParam TArgs - The type of the arguments used to validate the cache entry.
 */
type CacheValidator<TType, TArgs> = (entry: QueryCacheRecord<TType, TArgs>, args: TArgs) => boolean;

/**
 * The default function for validating cache entries based on expiration time.
 * This function generates a validator that checks whether the cache entry has expired based on the current time
 * and the expiration time provided. If the expiration time is 0, the cache entry is always considered invalid.
 *
 * @typeParam TType - The type of the data in the cache entry.
 * @typeParam TArgs - The type of the arguments used to validate the cache entry.
 * @param expires - The expiration time in milliseconds. If 0, the cache entry is always considered invalid.
 * @returns A function that takes a cache entry and returns a boolean indicating whether the entry is still valid.
 */
const defaultCacheValidator =
    <TType, TArgs>(expires = 0): CacheValidator<TType, TArgs> =>
    (entry) =>
        (entry.updated ?? 0) + expires > Date.now();

/**
 * A type alias for the predefined operator types that can be used to control query request queuing.
 * These operator types are used to define different strategies for handling concurrent query requests.
 */
type QueueOperatorType = 'switch' | 'merge' | 'concat';

/**
 * A utility function that returns a query queue function based on the provided operator type or custom function.
 * The queue function is responsible for controlling how query requests are processed in relation to each other.
 * Depending on the chosen strategy, requests can be canceled, run in parallel, or executed sequentially.
 *
 * The 'switch' operator (default) cancels any ongoing request when a new one comes in, ensuring that only the latest request is processed.
 * The 'merge' operator allows multiple requests to be processed in parallel without waiting for any to complete.
 * The 'concat' operator processes requests one after another, in the order they were added to the queue, waiting for each to complete before starting the next.
 *
 * @typeParam TType - The type of the data returned by the query.
 * @typeParam TArgs - The type of the arguments passed to the query function.
 * @param type - The operator type ('switch', 'merge', 'concat') or custom function to use for queuing requests. Defaults to 'switch'.
 * @returns A function that takes a query request and returns an Observable representing the queued request.
 */
const useQueueOperator = <TType, TArgs>(
    type: QueueOperatorType | QueryQueueFn<TType, TArgs> = 'switch',
): QueryQueueFn<TType, TArgs> => {
    if (typeof type === 'function') {
        return type;
    }
    return (() => {
        switch (type) {
            case 'concat':
                return concatQueue;
            case 'merge':
                return mergeQueue;
            case 'switch':
                return switchQueue;
            default:
                throw new Error(`Invalid queue operator: ${type}`);
        }
    })() as QueryQueueFn<TType, TArgs>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Query<TType, TArgs = any> {
    /**
     * A static method that extracts the value from a query task.
     * It is a utility function that can be used externally to access the result of a task.
     */
    static extractQueryValue = queryValue;

    /**
     * A private Subscription instance that holds all internal subscriptions.
     * It is used for cleanup when the query is completed or no longer needed.
     * This ensures that all resources are properly released and no memory leaks occur.
     */
    #subscription = new Subscription();
    /**
     * A private instance of QueryClient that is used to fetch data.
     * This client encapsulates the logic for making the actual query requests and handling their responses.
     */
    #client: QueryClient<TType, TArgs>;
    /**
     * A private instance of QueryCache that is used to cache query results.
     * This cache stores the results of queries, allowing for quick retrieval of data without the need to make additional network requests.
     */
    #cache: QueryCache<TType, TArgs>;
    /**
     * A private Subject that represents the queue of query requests.
     * This queue is used to manage the execution of concurrent query requests according to the chosen queuing strategy.
     */
    #queue$ = new Subject<string>();
    /**
     * A private record object that stores ongoing query tasks, indexed by a unique reference key.
     * This record keeps track of all active query tasks, allowing for management and coordination of their execution.
     */
    #tasks: Record<string, QueryTask<TType, TArgs>> = {};

    /**
     * A private function that generates a unique cache key for the provided arguments.
     * This key is used to store and retrieve cache entries, ensuring that each set of arguments has its own distinct entry.
     */
    #generateCacheKey: QueryKeyBuilder<TArgs>;
    /**
     * A private function that validates cache entries.
     * This function is called to determine whether a cache entry is still valid or if it should be considered stale and discarded.
     */
    #validateCacheEntry: CacheValidator<TType, TArgs>;

    /**
     * A private unique namespace string generated using a UUID.
     * It is used to ensure cache keys are unique across different instances of the query.
     * This prevents cache collisions where different queries could otherwise end up using the same cache entry.
     */
    #namespace = generateGUID();

    /**
     * A private logger instance used for logging events and operations within the Query class.
     * If a logger is not provided in the constructor options, a default ConsoleLogger is used.
     */
    #logger: ILogger;

    /**
     * A public getter for the client instance.
     * TODO: Implement a proxy to control access to the client.
     * This proxy would allow for additional functionality or restrictions when accessing the client instance.
     */
    public get client(): QueryClient<TType, TArgs> {
        // TODO: Proxy
        return this.#client;
    }

    /**
     * A public getter for the cache instance.
     * TODO: Implement a proxy to control access to the cache.
     * This proxy would allow for additional functionality or restrictions when accessing the cache instance.
     */
    public get cache(): QueryCache<TType, TArgs> {
        // TODO: Proxy
        return this.#cache;
    }

    /**
     * The constructor for the Query class.
     * It initializes the query client, cache, and sets up the query request queue.
     * The constructor takes an options object which can include a custom client, cache, key generation function,
     * cache validation function, cache expiration time, queuing strategy, and a logger.
     *
     * @param options - The constructor options for the Query instance.
     */
    constructor(options: QueryCtorOptions<TType, TArgs>) {
        this.#logger = options.logger ?? new ConsoleLogger('Query', this.#namespace);

        this.#generateCacheKey = (args: TArgs) => {
            // Use the provided key generation function from options and namespace to ensure unique cache keys across instances
            return generateUniqueKey(options.key(args), this.#namespace);
        };
        // Set the cache entry validation function. Use the provided one or the default based on expiration time
        this.#validateCacheEntry =
            options?.validate ?? defaultCacheValidator<TType, TArgs>(options?.expire);

        // Initialize the query client. Use the provided client instance or create a new one with provided function and options
        if (options.client instanceof QueryClient) {
            this.#client = options.client;
        } else {
            this.#client = new QueryClient(options.client.fn, {
                // Create a sub-logger for the client for more granular logging
                logger: this.#logger.createSubLogger('Client'),
                // Spread any additional options provided for the client
                ...options.client.options,
            });
            // Ensure client resources are cleaned up when the query instance is disposed
            this.#subscription.add(() => this.#client.complete());
        }

        // Initialize the query cache. Use the provided cache instance or create a new one with provided constructor arguments
        if (options.cache instanceof QueryCache) {
            this.#cache = options.cache;
        } else {
            // If no cache is provided, create a new instance with default or provided constructor arguments
            this.#cache = new QueryCache(options.cache || {});
            // Ensure cache resources are cleaned up when the query instance is disposed
            this.#subscription.add(() => this.#cache.complete());
        }

        // The queueOperator is a function that determines how query requests are handled when multiple requests are made concurrently.
        // It is derived from the useQueueOperator utility function, which takes the provided queueOperatorType or custom function
        // from the QueryCtorOptions and returns the corresponding queue function.
        // The queue function is then used in the observable pipeline to manage the execution of query requests according to the chosen strategy.
        const queueOperator = useQueueOperator(options.queueOperator);

        // shutdown the queue when the query is completed
        this.#subscription.add(() => this.#queue$.complete());

        this.#subscription.add(
            this.#queue$
                .pipe(
                    tap((key) => this.#logger.debug('Task added to queue', { key })),
                    // skip tasks that are not in the ongoing tasks record
                    filter((key) => !!(key in this.#tasks)),
                    // Apply the queue operator to the query requests, which controls the execution order
                    queueOperator((key) => {
                        const task = this.#tasks[key];
                        const { args, options, uuid } = task;
                        this.#logger.debug('Task selected from queue', {
                            key,
                            task: task.uuid,
                            args,
                            options,
                        });

                        // Check if the task is still observed, if not, skip it
                        if (!task?.observed) {
                            this.#logger.debug('Task skipped', {
                                task: uuid,
                            });
                            delete this.#tasks[key];
                            return EMPTY;
                        }

                        // Initiate a new query using the client, passing in the arguments and options
                        // The 'ref' option is used to associate the task with a specific query request
                        const job = this.#client.query(args, {
                            ...options,
                            ref: task.uuid,
                        });

                        return new Observable((subscriber) => {
                            const { transaction } = job;
                            this.#logger.info('Task stated', {
                                task: uuid,
                                transaction,
                            });

                            // Add a cleanup function to the subscriber that will be called when the subscription is closed.
                            // This function logs the task closure, cancels the job to prevent further processing, and removes the task from the ongoing tasks record.
                            subscriber.add(() => {
                                this.#logger.debug('Task closed', {
                                    task: uuid,
                                    transaction,
                                    jobStatus: job.status,
                                });
                                job.complete('task closed');
                                delete this.#tasks[key];
                            });

                            // Add a periodic check to the subscriber that will cancel the job if it is no longer observed.
                            // This is to ensure resources are not wasted on tasks that are no longer of interest.
                            subscriber.add(
                                interval(10)
                                    .pipe(filter(() => !task.observed))
                                    .subscribe(() => {
                                        job.cancel(`task: ${task.uuid} is not observed`);
                                        subscriber.complete();
                                    }),
                            );

                            // Process the job using the task's custom logic, which includes handling of the query response and any errors.
                            // This processing is specific to the task and may involve updating the cache, logging, or other side effects.
                            subscriber.add(task.processJob(job, this.#logger));

                            // Map the job Observable to a QueryQueueResult object, which includes the result and request details.
                            // This mapping allows the subscriber to receive a structured response including the task details and the query result.
                            job.pipe(
                                map(
                                    (result) =>
                                        ({
                                            result,
                                            task,
                                        }) satisfies QueryQueueResult<TType, TArgs>,
                                ),
                                // Catch any errors that occur during the job processing and complete the observable to prevent hanging subscriptions.
                                // This ensures that errors are handled gracefully and do not prevent the completion of the observable chain.
                                catchError(() => EMPTY),
                            ).subscribe(subscriber);
                        });
                    }),
                    takeWhile(() => !this.#client.closed),
                )
                // Subscribe to the processed tasks and update the cache with their results
                .subscribe((task) => {
                    const { value, transaction } = task.result;
                    const { args, key, uuid } = task.task;

                    this.#logger.debug('Task output added to cache', {
                        uuid,
                        args,
                        key,
                        transaction,
                        value,
                    });

                    // Update the cache item with the new value, arguments, and transaction
                    this.#cache.setItem(key, {
                        value,
                        args,
                        transaction,
                    });
                }),
        );
    }

    /**
     * Executes a query and returns an Observable that emits the result.
     * It will throw an error if the query was skipped or canceled.
     * The returned Observable can be subscribed to in order to receive updates on the query's execution and results.
     *
     * @param args - The arguments to be passed to the query function.
     * @param options - Optional additional options for the query.
     * @returns An Observable that emits the result of the query.
     */
    public query(
        args: TArgs,
        options?: QueryOptions<TType, TArgs>,
    ): Observable<QueryTaskCached<TType> | QueryTaskCompleted<TType>> {
        return this._query(args, options);
    }

    /**
     * Executes an asynchronous query and returns a Promise that resolves with the result.
     * If `skipResolve` is set to true, the Promise resolves as soon as the query is sent (using `firstValueFrom`).
     * If `skipResolve` is false or not provided, the Promise resolves with the final result of the query (using `lastValueFrom`).
     * This method is useful for cases where an asynchronous, one-time result is needed rather than a stream of updates.
     * Note that skipping resolution may result in returning invalid cache.
     *
     * @param payload - The arguments to be passed to the query function.
     * @param opt - Optional additional options for the query. The `skipResolve` option determines the resolution behavior of the Promise.
     * @returns A Promise that resolves with the result of the query or rejects with an Error.
     */
    public queryAsync(
        payload: TArgs,
        opt?: QueryOptions<TType, TArgs> & { skipResolve?: boolean },
    ): Promise<QueryTaskCached<TType> | QueryTaskCompleted<TType>> {
        const { skipResolve, ...args } = opt || {};
        const fn = skipResolve ? firstValueFrom : lastValueFrom;
        return new Promise((resolve, reject) => {
            if (opt?.signal) {
                opt.signal.addEventListener('abort', () => reject(new Error('Query aborted')));
            }
            fn(this._query(payload, args).pipe(throwIfEmpty())).then(resolve, reject);
        });
    }

    /**
     * Performs a mutation on the cache entry associated with the given arguments.
     * This method allows for updating the state of a cache entry without needing to perform a new query.
     * The changes are applied by invoking the `mutate` method on the cache with the generated key and the changes function.
     *
     * @param args - The arguments that identify the specific cache entry to be mutated.
     * @param changes - A function that defines the changes to be applied to the cache entry.
     */
    public mutate(args: TArgs, changes: Parameters<QueryCache<TType, TArgs>['mutate']>[1]): void {
        const key = this.#generateCacheKey(args);
        this.#cache.mutate(key, changes);
    }

    /**
     * Invalidates a specific cache record or all records if no arguments are provided.
     * When a specific record is invalidated, it is identified by the provided arguments.
     * If no arguments are provided, all records in the cache are invalidated, effectively clearing the cache.
     *
     * @param args - Optional arguments that identify the specific cache record to be invalidated.
     *             If not provided, all cache records will be invalidated.
     */
    public invalidate(args?: TArgs): void {
        this.#cache.invalidate(args && this.#generateCacheKey(args));
    }

    /**
     * Completes all subscriptions and cleans up resources.
     * This method should be called when the Query instance is no longer needed, to ensure that all resources are properly released.
     * Failing to call `complete` could result in memory leaks due to lingering subscriptions.
     */
    public complete() {
        this.#subscription.unsubscribe();
    }

    //#region Event Handlers

    /**
     * Registers a callback function that will be invoked when a cache invalidation occurs.
     * The callback function will receive an event object containing the details of the invalidation,
     * including the affected cache entry, if available.
     * The returned function can be called to unsubscribe the callback from further invalidation events.
     *
     * @param cb - The callback function to be registered.
     * @returns A function that, when called, will unsubscribe the callback from further invalidation events.
     */
    onInvalidate(cb: (e: { detail: { item?: QueryCacheRecord } }) => void): VoidFunction {
        const subscription = this.#cache.action$
            .pipe(filterAction('cache/invalidate'))
            .subscribe((action) => cb({ detail: { item: action.meta.item } }));
        return () => subscription.unsubscribe();
    }

    /**
     * Registers a callback function that will be invoked when a mutation occurs on the cache.
     * The callback function will receive an event object containing the details of the mutation,
     * including the changes made and the current state of the cache entry, if available.
     *
     * @param cb - The callback function to be registered.
     * @returns A function that, when called, will unsubscribe the callback from further mutation events.
     */
    onMutate(
        cb: (e: {
            detail: { changes: QueryCacheMutation; current?: QueryCacheRecord<TType, TArgs> };
        }) => void,
    ): VoidFunction {
        const subscription = this.#cache.action$
            .pipe(filterAction('cache/mutate'))
            .subscribe((action) =>
                cb({ detail: { changes: action.payload, current: action.meta.item } }),
            );
        return () => subscription.unsubscribe();
    }
    //#endregion

    /**
     * Internal method that executes a query and returns an Observable with the result.
     *
     * @param args - The arguments to be passed to the query function.
     * @param options - Optional additional options for the query.
     * @returns An Observable that emits the result of the query.
     */
    protected _query(
        args: TArgs,
        options?: QueryOptions<TType, TArgs>,
    ): Observable<QueryTaskCached<TType> | QueryTaskCompleted<TType>> {
        const key = this.#generateCacheKey(args);
        const task = this._createTask(key, args, options);

        this.#logger.debug('New query created', { key, args, options });

        return task;
    }

    /**
     * The `_createTask` method is responsible for initiating a query task, which involves either returning a cached result or
     * starting a new query request. This method encapsulates the logic for creating and managing the lifecycle of a query task.
     * It ensures that if a query with the same arguments is initiated multiple times, they will all share the same task observable,
     * thus avoiding duplicate network requests and unnecessary computation.
     *
     * @param key - A string that uniquely identifies the cache entry associated with the query arguments. This key is used to
     *              check if there is already a cached result that can be returned immediately, avoiding the need for a new network request.
     * @param args - The arguments that will be passed to the query function. These arguments are used to generate the cache key
     *               and are also passed to the query function when making a new request.
     * @param options - An optional object containing additional options for the query. This can include custom cache validation
     *                  logic and retry strategies. For example, options can specify whether to suppress the emission of invalid
     *                  cache entries or to define a custom function for validating the cache.
     *
     * @returns An Observable that emits the result of the query task. If a valid cache entry is found, the Observable will emit
     *          the cached result. If no valid cache entry exists, the Observable will emit the result of a new query request once
     *          it completes. Subscribers to this Observable will receive updates on the query's execution and results.
     *
     * The method performs the following steps:
     * 1. Creates a new Observable that represents the task to be executed.
     * 2. Attempts to retrieve a cache entry using the provided `key`.
     * 3. If a cache entry is found, it checks whether the entry is still valid using the provided validation function or the default one.
     *    - If the cache entry is valid, it emits the cached result and completes the Observable.
     *    - If the cache entry is not valid or does not exist, it proceeds to the next step.
     * 4. Checks if there is already an ongoing task for the same query (identified by the `key`).
     *    - If there is an ongoing task, it subscribes the new Observable to the existing task.
     *    - If there is no ongoing task, it creates a new `QueryTask` instance and adds it to the ongoing tasks record.
     * 5. Subscribes to the new or existing task, forwarding any emissions to the subscriber of the returned Observable.
     * 6. Adds the new task to the query queue by emitting the `key` on the `#queue$` Subject, which will eventually trigger the processing
     *    of the task based on the queuing strategy.
     * 7. The task is finalized (removed from the ongoing tasks record) when it completes or errors out.
     *
     * Note: The subscribers to the returned Observable are responsible for subscribing and unsubscribing to manage the lifecycle of the
     *       subscription. The method ensures that the task is properly cleaned up when it is no longer needed.
     */
    protected _createTask(
        key: string,
        args: TArgs,
        options?: QueryOptions<TType, TArgs>,
    ): Observable<QueryTaskCached<TType> | QueryTaskCompleted<TType>> {
        // Create a new Observable that represents the query task and will be returned to the caller.
        return new Observable((subscriber) => {
            if (options?.signal) {
                if (options?.signal.aborted) {
                    this.#logger.debug('Abort signal already triggered by caller', { key });
                    return subscriber.complete();
                }
                subscriber.add(
                    fromEvent(options?.signal, 'abort').subscribe(() => {
                        this.#logger.debug('Abort signal triggered by caller', { key });
                        subscriber.complete();
                    }),
                );
            }

            // Attempt to retrieve the cache entry associated with the provided key.
            const cacheEntry = this.#cache.getItem(key);

            // If a cache entry exists and is valid, emit it as the next value to the subscriber.
            if (cacheEntry) {
                this.#logger.debug('Query has cache', {
                    key,
                    cacheEntry,
                });

                const suppressInvalid = options?.cache?.suppressInvalid ?? false;

                // Use the provided validation function or the default cache validator to determine if the cache entry is valid.
                const validateCache = options?.cache?.validate || this.#validateCacheEntry;

                // Check if the cache entry is valid based on the provided validation function.
                const hasValidCache = validateCache(cacheEntry, args);

                const record = {
                    ...cacheEntry,
                    key,
                    status: 'cache',
                    hasValidCache,
                } satisfies QueryTaskCached<TType>;

                this.#logger.info('Query cache valid, completing', {
                    hasValidCache,
                    suppressInvalid,
                    record,
                });

                // Emit the cache entry as the next value to the subscriber. This step is crucial as it allows
                // the subscriber to receive the cached data immediately, without waiting for a new fetch operation.
                // The emitted record contains the cache entry data, along with metadata such as the cache key,
                // the status indicating that this is a cached response, and a flag indicating whether the cache
                // is considered valid based on the validation logic.
                subscriber.next(record);

                if (hasValidCache || suppressInvalid) {
                    // If the cache is valid, or if invalid cache entries should be suppressed (not re-fetched),
                    // complete the subscription to prevent further actions.
                    // This ensures that if the cache data is sufficient or if the strategy is to avoid using invalid cache without refetching,
                    // the observable sequence completes here.
                    return subscriber.complete();
                }
                // This will fetch new data and update the cache entry with the latest result.
                this.#logger.debug('Query cache entry is invalid, proceeding to fetch new data', {
                    key,
                });
            }

            // If the cache entry does not exist or is invalid, proceed to queue a new query request.
            const isExistingTask = key in this.#tasks;
            this.#tasks[key] ??= new QueryTask<TType, TArgs>(key, args, options);
            const task = this.#tasks[key];

            // Connect the subscriber to the task to receive updates on the query's execution and results.
            subscriber.add(task.subscribe(subscriber));

            this.#logger.info(
                isExistingTask ? 'Query connected to existing task' : 'Query started new task',
                {
                    key,
                },
            );

            // If this is a new task, add it to the query queue to be processed.
            if (!isExistingTask) {
                this.#queue$.next(key);
            }
        });
    }
}

export default Query;
