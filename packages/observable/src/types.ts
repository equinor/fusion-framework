import { Observable, ObservableInput } from 'rxjs';

export { Observable };

export type ObservableType<T> = T extends Observable<infer U> ? U : never;

export type Reducer<S, A> = (prevState: S, action: A) => S;
export type ReducerState<R extends Reducer<unknown, unknown>> = R extends Reducer<infer S, unknown>
    ? S
    : never;
export type ReducerAction<R extends Reducer<unknown, unknown>> = R extends Reducer<unknown, infer A>
    ? A
    : never;

export type TypeConstant = string;

export type Action<T extends TypeConstant = TypeConstant> = { type: T };

export type PayloadAction<T extends TypeConstant = TypeConstant, P = unknown> = Action<T> & {
    payload: P;
};

export type MetaAction<T extends TypeConstant = TypeConstant, M = unknown> = Action<T> & {
    meta: M;
};

export type PayloadMetaAction<
    TType extends TypeConstant = TypeConstant,
    TPayload = unknown,
    TMeta = unknown
> = PayloadAction<TType, TPayload> & MetaAction<TType, TMeta>;

export type ActionType<T extends Action> = T['type'];
export type ActionMeta<T extends MetaAction> = T['meta'];
export type ActionPayload<T extends PayloadAction> = T['payload'];

export type ExtractAction<
    TAction extends Action,
    TType extends TypeConstant = ActionType<TAction>
> = Extract<TAction, Action<TType>>;

export type Effect<TAction extends Action, TState = unknown> = (
    action: TAction,
    state: TState
) => ObservableInput<TAction | void> | TAction | void;

export type Epic<TAction extends Action, TState = unknown> = (
    action: Observable<TAction>,
    state: Observable<TState>
) => Observable<TAction>;

// const test = {
//     a: (): Action => ({ type: 'test' }),
//     b: (): Action<number> => ({ type: '', payload: 3 }),
//     b: (): Action<number, number> => ({ type: '', meta: 3, payload: 4 }),
//     b: (): Action<undefined, number> => ({}),
// };

// type M = Action<number, { id: string }, 'test'>;

// type G = ActionType<M>;
// type GG = ActionPayload<M>;
// type GGG = ActionMeta<M>;

test;
