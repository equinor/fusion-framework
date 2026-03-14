import { useState } from 'react';
import { FlowSubject } from '../FlowSubject';

import type { Action, Reducer, ReducerWithInitialState } from '../types';

/**
 * React hook that creates and memoises a {@link FlowSubject} from a reducer and
 * an initial state. The subject is created once and persists for the lifetime
 * of the component.
 *
 * @template S - The state type.
 * @template A - The action type.
 * @param reducer - A reducer function.
 * @param initial - The initial state value.
 * @returns A stable `FlowSubject` instance.
 *
 * @example
 * ```tsx
 * const subject = useObservable(myReducer, { count: 0 });
 * subject.next({ type: 'increment' });
 * ```
 */
export function useObservable<S, A extends Action = Action>(
  reducer: Reducer<S, A>,
  initial: S,
): FlowSubject<S, A>;

/**
 * React hook overload that accepts a reducer with a built-in initial state.
 *
 * @template S - The state type.
 * @template A - The action type.
 * @param reducer - A `ReducerWithInitialState` (e.g., created by `createReducer`).
 * @returns A stable `FlowSubject` instance.
 */
export function useObservable<S, A extends Action = Action>(
  reducer: ReducerWithInitialState<S, A>,
): FlowSubject<S, A>;

// Implementation
export function useObservable<S, A extends Action = Action>(
  reducer: Reducer<S, A> | ReducerWithInitialState<S, A>,
  initial?: S,
): FlowSubject<S, A> {
  return useState(
    initial
      ? new FlowSubject(reducer as Reducer<S, A>, initial)
      : new FlowSubject(reducer as ReducerWithInitialState<S, A>),
  )[0];
}
