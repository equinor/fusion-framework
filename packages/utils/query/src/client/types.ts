import { ObservableInput, Subject } from 'rxjs';

// export type Status = 'idle' | 'active' | 'failed' | 'canceled';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryTaskValue<TValue = any, TArgs = any> = {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type State<TType = any, TArgs = any> = Record<string, QueueItem<TType, TArgs>>;

export type RetryOptions = {
    count: number;
    delay: number | ((error: unknown) => ObservableInput<void>);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryFn<TType = any, TArgs = any> = (
    args: TArgs,
    signal?: AbortSignal,
) => ObservableInput<TType>;
