import { useState } from 'react';
import { FlowSubject } from '../FlowSubject';

import type { Action, Reducer, ReducerWithInitialState } from '../types';

// Function overloads
export function useObservable<S, A extends Action = Action>(
  reducer: Reducer<S, A>,
  initial: S,
): FlowSubject<S, A>;
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
