import type { Action, AnyAction } from './actions';
import type { NotFunction } from './ts-helpers';

/**
 * A pure function that takes a previous state and an action, and returns
 * the next state.
 *
 * @template S - The state type.
 * @template A - The action type.
 */
export type Reducer<S, A> = (prevState: S, action: A) => S;

/**
 * Extracts the state type from a {@link Reducer}.
 *
 * @template R - A reducer type.
 */
export type ReducerState<R extends Reducer<unknown, unknown>> =
  R extends Reducer<infer S, unknown> ? S : never;

/**
 * Extracts the action type from a {@link Reducer}.
 *
 * @template R - A reducer type.
 */
export type ReducerAction<R extends Reducer<unknown, unknown>> =
  R extends Reducer<unknown, infer A> ? A : never;

/**
 * A reducer that also exposes a `getInitialState()` method, used by
 * {@link FlowSubject} and {@link createReducer} to obtain the starting state.
 *
 * @template S - The state type (must not be a function to avoid ambiguity).
 * @template A - The action type.
 */
export type ReducerWithInitialState<
  S extends NotFunction<unknown>,
  A extends Action = AnyAction,
> = Reducer<S, A> & {
  getInitialState: () => S;
};
