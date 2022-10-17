import type { ObservableInput } from 'rxjs';

export type Status = 'idle' | 'active' | 'failed' | 'canceled';

export type State = {
    status: Status;
    transaction?: string;
    initiated?: number;
    retryCount?: number;
    completed?: number;
    error?: unknown;
};

export type RetryOptions = {
    count: number;
    delay: number | ((error: unknown) => ObservableInput<void>);
};

export type QueryFn<TType, TArgs> = (args: TArgs, signal?: AbortSignal) => ObservableInput<TType>;
