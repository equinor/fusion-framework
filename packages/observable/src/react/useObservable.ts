import { useState } from 'react';
import { ReactiveSubject } from '../ReactiveSubject';

import { Action, Reducer } from '../types';

export const useObservable = <S, A extends Action = Action>(
    reducer: Reducer<S, A>,
    initial: S
): ReactiveSubject<S, A> => useState(new ReactiveSubject(reducer, initial))[0];
