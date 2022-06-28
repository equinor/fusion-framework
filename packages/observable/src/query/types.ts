import type { ObservableInput } from 'rxjs';

export type QueryState = {
    status: QueryStatus;
    transaction?: string;
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

export type RetryOpt = {
    count: number;
    delay: number | ((error: unknown) => ObservableInput<void>);
};

export type QueryFn<TType, TArgs> = (args: TArgs, signal: AbortSignal) => ObservableInput<TType>;
