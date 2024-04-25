import type { Observable, ObservableInput, OperatorFunction } from 'rxjs';
import type { QueryCacheRecord } from './cache';
import type { QueryClientOptions, QueryClientResult, RetryOptions } from './client';
import { QueryTask } from './QueryTask';

/**
 * Representation of item in the query queue.
 * @template TArgs The type of the arguments passed to the query function. Defaults to unknown.
 */
export type QueryQueueItem<TArgs> = {
    /**
     * A unique identifier for the task to be executed.
     */
    task: string;
    /**
     * The arguments to be passed to the task.
     */
    args: TArgs;
    /**
     * The timestamp when the item was created.
     */
    created: number;
    /**
     * Optional configurations for the query client.
     */
    options?: Partial<QueryClientOptions>;
};

/**
 * Represents a query result with its status, transaction details, arguments, and value.
 * @template TValue The type of the value returned by the query. Defaults to unknown.
 */
export type QueryTaskValue<TValue = unknown> = {
    /**
     * A unique key that identifies the task.
     */
    key: string;
    /**
     * The current status of the task.
     */
    status: string;
    /**
     * A unique identifier for the transaction.
     */
    transaction: string;
    /**
     * The timestamp when the task was created.
     */
    created: number;
    /**
     * The value returned by the task.
     */
    value: TValue;
};

/**
 * Represents a query result which is completed
 * @template TValue The type of the value returned by the query. Defaults to unknown.
 */
export type QueryTaskCompleted<TValue> = QueryTaskValue<TValue> & {
    /**
     * A unique identifier for the completed task.
     */
    uuid: string;
    /**
     * The status of the task, which is always 'complete' for this type.
     */
    status: 'complete';
    /**
     * The timestamp when the task was completed.
     */
    complete: number;
};

/**
 * Represents a query result which is cached
 * @template TValue The type of the value returned by the query. Defaults to unknown.
 */
export type QueryTaskCached<TValue> = Omit<QueryTaskValue<TValue>, 'uuid'> & {
    /**
     * The status of the task, which is always 'cache' for this type.
     */
    status: 'cache';
    /**
     * The timestamp when the task was last updated.
     */
    updated?: number;
    /**
     * The number of times the task has been updated.
     */
    updates?: number;
    /**
     * The timestamp when the task was last mutated.
     */
    mutated?: number;

    /**
     * flag if the cache was valid
     */
    hasValidCache?: boolean;
};

/**
 * Represents of a completed query task
 * Result after a query task has been completed.
 * @template TValue The type of the value returned by the query. Defaults to unknown.
 */
export type QueryQueueResult<TValue = unknown, TArgs = unknown> = {
    /**
     * The task that was executed.
     */
    task: QueryTask<TValue, TArgs>;
    /**
     * The result of executing the task.
     */
    result: QueryClientResult<TValue, TArgs>;
};

/**
 * Cache validator function.
 * @template TType The type of the query result.
 * @returns A boolean value indicating whether the cache entry is still valid.
 */
export type CacheValidator<TType, TArgs> = (
    /**
     * The cache record to be validated.
     */
    entry: QueryCacheRecord<TType, TArgs>,
    /**
     * The arguments used for validation.
     */
    args: TArgs,
) => boolean;

/**
 * Cache options for a query.
 * @template TType The type of the query result.
 * @template TArgs The type of the query arguments.
 */
export type CacheOptions<TType, TArgs> = {
    /**
     * A function to generate a unique key for caching based on the query arguments.
     */
    key: (query: TArgs) => string;

    /**
     * A function to validate if a cache entry is still valid.
     */
    validate: CacheValidator<TType, TArgs>;
};

/**
 * Query options for a query.
 * @template TType The type of the query result.
 * @template TArgs The type of the query arguments.
 */
export type QueryOptions<TType, TArgs = unknown> = {
    /**
     * An optional AbortSignal to cancel the request.
     */
    signal?: AbortSignal;
    /**
     * Configuration for retry behavior.
     */
    retry?: Partial<RetryOptions>;
    /**
     * Cache options.
     */
    cache?: {
        /**
         * Whether to suppress errors when a cache entry is invalid.
         */
        suppressInvalid: boolean;
        /**
         * An optional function to validate cache entries.
         */
        validate?: CacheValidator<TType, TArgs>;
    };
};

/**
 * Options for retrying a query.
 */
export type RetryOpt = {
    /**
     * The maximum number of retry attempts.
     */
    count: number;
    /**
     * The delay between retries, either as a fixed number of milliseconds or a function that returns an ObservableInput.
     */
    delay: number | ((error: unknown) => ObservableInput<void>);
};

/**
 * Callback function for a query.
 * @template TType The type of the query result.
 * @template TArgs The type of the query arguments.
 */
export type QueryFn<TType, TArgs> = (
    /**
     * The arguments for the query function.
     */
    args: TArgs,
    /**
     * An optional AbortSignal to cancel the query.
     */
    signal?: AbortSignal,
) => ObservableInput<TType>;

/**
 * Queue operator function for queries.
 * Operator function for controlling the processing of queries in a queue.
 * @template TValue The type of the value returned by the query. Defaults to unknown.
 * @template TArgs The type of the arguments passed to the query function. Defaults to unknown.
 */
export type QueryQueueFn<TValue = unknown, TArgs = unknown> = (
    /**
     * A function that takes a task identifier and returns an Observable of the query queue result.
     */
    fn: (task: string) => Observable<QueryQueueResult<TValue, TArgs>>,
) => OperatorFunction<string, QueryQueueResult<TValue, TArgs>>;
