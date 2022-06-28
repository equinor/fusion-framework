import { Observable, ObservableInput } from 'rxjs';

export { Observable };

export type Reducer<S, A> = (prevState: S, action: A) => S;
export type ReducerState<R extends Reducer<unknown, unknown>> = R extends Reducer<infer S, unknown>
    ? S
    : never;
export type ReducerAction<R extends Reducer<unknown, unknown>> = R extends Reducer<unknown, infer A>
    ? A
    : never;

export type Action<T extends string = string> = { type: T };
export type ActionType<T extends Action> = T extends Action<infer R> ? R : T['type'];
export type PayloadAction<T extends string = string, P = unknown> = Action<T> & { payload: P };
export type ActionPayload<T extends PayloadAction> = T extends PayloadAction<string, infer R>
    ? R
    : never;
export type ExtractAction<
    TAction extends Action,
    TType extends string = ActionType<TAction>
> = Extract<TAction, Action<TType>>;

export type Effect<TAction extends Action, TState = unknown> = (
    action: TAction,
    state: TState
) => ObservableInput<TAction | void> | TAction | void;

export type Epic<TAction extends Action, TState = unknown> = (
    action: Observable<TAction>,
    state: Observable<TState>
) => Observable<TAction>;
