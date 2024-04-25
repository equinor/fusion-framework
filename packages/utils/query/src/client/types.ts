import { ObservableInput } from 'rxjs';
import { QueryClientOptions } from './QueryClient';

/**
 * Represents a request made by the QueryClient with its status, transaction details, arguments, options, and metadata.
 * @template TArgs The type of the arguments passed to the query function. Defaults to unknown.
 */
export type QueryClientRequest<TArgs = unknown> = {
    /** The current status of the request. */
    status: 'idle' | 'active' | 'failed' | 'complete';
    /** A unique identifier for the transaction. */
    transaction: string;
    /** Arguments passed to the query function. */
    args: TArgs;
    /** Optional configuration options for the query. */
    options?: QueryClientOptions;
    /** Timestamp when the request was created. */
    created: number;
    /** An array of timestamps marking the execution points of the request. */
    execution: Array<number>;
    /** An array of errors encountered during the request's lifecycle. */
    errors: Array<unknown>;
    /** An optional reference identifier. */
    ref?: string;
};

/**
 * Represents the result of a completed query, including the value returned and metadata.
 * @template TValue The type of the value returned by the query. Defaults to unknown.
 * @template TArgs The type of the arguments passed to the query function. Defaults to unknown.
 */
export type QueryClientResult<TValue = unknown, TArgs = unknown> = Omit<
    QueryClientRequest<TArgs>,
    'status'
> & {
    /** Status set to 'complete' to indicate the request has finished. */
    status: 'complete';
    /** Timestamp when the request was completed. */
    completed: number;
    /** Timestamp when the request was created. */
    created: number;
    /** The value returned by the query. */
    value: TValue;
};

/**
 * Represents the state of queries managed by the QueryClient, indexed by a unique key.
 * @template TArgs The type of the arguments passed to the query function. Defaults to unknown.
 */
export type QueryClientState<TArgs = unknown> = Record<string, QueryClientRequest<TArgs>>;

/**
 * Configuration options for retrying failed queries.
 */
export type RetryOptions = {
    /** The number of retry attempts. */
    count: number;
    /** The delay between retries, either as a fixed number of milliseconds or a function returning an ObservableInput. */
    delay: number | ((error: unknown) => ObservableInput<void>);
};

/**
 * Defines the function signature for a query function that the QueryClient can execute.
 * @template TType The expected return type of the query function. Defaults to unknown.
 * @template TArgs The type of the arguments passed to the query function. Defaults to unknown.
 * @param args Arguments to pass to the query function.
 * @param signal An optional AbortSignal to cancel the request.
 * @returns An ObservableInput of the expected return type.
 */
export type QueryFn<TType = unknown, TArgs = unknown> = (
    args: TArgs,
    signal?: AbortSignal,
) => ObservableInput<TType>;
