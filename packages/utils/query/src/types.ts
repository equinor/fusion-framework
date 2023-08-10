import type { Observable, ObservableInput, OperatorFunction } from 'rxjs';
import type { QueryCacheRecord } from './cache';
import type { QueryClientOptions, QueryTaskValue } from './client';

export type QueryState = {
    status: QueryStatus;
    transaction: string;
    initiated?: number;
    retryCount?: number;
    completed?: number;
    error?: unknown;
};

export enum QueryStatus {
    IDLE = 'idle',
    ACTIVE = 'active',
    FAILED = 'failed',
    CANCELED = 'canceled',
}

export type CacheValidator<TType, TArgs> = (
    entry: QueryCacheRecord<TType, TArgs>,
    args: TArgs,
) => boolean;

export type CacheOptions<TType, TArgs> = {
    key: (query: TArgs) => string;
    validate: CacheValidator<TType, TArgs>;
};

export type QueryOptions<TType, TArgs = unknown> = {
    client?: Partial<QueryClientOptions>;
    cache?: {
        suppressInvalid: boolean;
        validate?: CacheValidator<TType, TArgs>;
    };
};

export type QueryTaskCached<TValue, TArgs> = QueryTaskValue<TValue, TArgs> & {
    status: 'cache';
    updated?: number;
    updates?: number;
};

export type QueryQueueItem<TArgs, TType> = {
    args: TArgs;
    options?: Partial<QueryClientOptions<TType, TArgs>>;
};

export type RetryOpt = {
    count: number;
    delay: number | ((error: unknown) => ObservableInput<void>);
};

export type QueryFn<TType, TArgs> = (args: TArgs, signal?: AbortSignal) => ObservableInput<TType>;

export type QueryQueueFn<TArgs = unknown, TType = unknown> = (
    fn: (args: QueryQueueItem<TArgs, TType>) => Observable<QueryTaskValue<TType, TArgs>>,
) => OperatorFunction<QueryQueueItem<TArgs, TType>, QueryTaskValue<TType, TArgs>>;
