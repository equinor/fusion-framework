export type Reducer<S, A> = (prevState: S, action: A) => S;
export type ReducerState<R extends Reducer<unknown, unknown>> = R extends Reducer<infer S, unknown>
    ? S
    : never;
export type ReducerAction<R extends Reducer<unknown, unknown>> = R extends Reducer<unknown, infer A>
    ? A
    : never;