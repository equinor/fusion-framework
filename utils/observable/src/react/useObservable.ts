import { useState } from 'react';
import { FlowSubject } from '../FlowSubject';

import type { Action, Reducer } from '../types';

export const useObservable = <S, A extends Action = Action>(
    reducer: Reducer<S, A>,
    initial: S
): FlowSubject<S, A> => useState(new FlowSubject(reducer, initial))[0];
