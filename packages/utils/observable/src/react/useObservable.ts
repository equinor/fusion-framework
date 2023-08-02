import { useState } from 'react';
import { FlowSubject } from '../FlowSubject';

import type { Action, Reducer, ReducerWithInitialState } from '../types';

interface useObservable<S, A extends Action = Action> {
    (reducer: Reducer<S, A>, initial: S): FlowSubject<S, A>;
}

interface useObservable<S, A extends Action = Action> {
    (reducer: ReducerWithInitialState<S, A>): FlowSubject<S, A>;
}

export const useObservable = <S, A extends Action = Action>(
    reducer: Reducer<S, A> | ReducerWithInitialState<S, A>,
    initial?: S,
): FlowSubject<S, A> =>
    useState(
        initial
            ? new FlowSubject(reducer, initial)
            : new FlowSubject(reducer as ReducerWithInitialState<S, A>),
    )[0];
