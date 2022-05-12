import { useState } from 'react';
import { ReactiveObservable } from '../ReactiveObservable';

import type { Action, Reducer } from '../types';

export const useObservable = <S, A extends Action = Action>(
    reducer: Reducer<S, A>,
    initial: S
): ReactiveObservable<S, A> => useState(new ReactiveObservable(reducer, initial))[0];
