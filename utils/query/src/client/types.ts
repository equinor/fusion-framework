import { ObservableInput, Subject } from 'rxjs';

// export type Status = 'idle' | 'active' | 'failed' | 'canceled';

export type QueryTaskValue<TValue = unknown, TArgs = unknown> = {
    status: string;
    transaction: string;
    created: number;
    args: TArgs;
    value: TValue;
};
export type QueryTaskCompleted<TValue, TArgs = unknown> = QueryTaskValue<TValue, TArgs> & {
    status: 'complete';
    ref?: string;
    completed: number;
};

export type QueryTask<TValue, TArgs = unknown> = Subject<QueryTaskValue<TValue, TArgs>>;

export type QueueItem<TType = unknown, TArgs = unknown> = {
    transaction: string;
    task: QueryTask<TType, TArgs>;
    created: number;
    retry?: Array<number>;
    errors?: Array<Error>;
    ref?: string;
};

export type State<TType = unknown, TArgs = unknown> = Record<string, QueueItem<TType, TArgs>>;

export type RetryOptions = {
    count: number;
    delay: number | ((error: unknown) => ObservableInput<void>);
};

export type QueryFn<TType = unknown, TArgs = unknown> = (
    args: TArgs,
    signal?: AbortSignal
) => ObservableInput<TType>;
