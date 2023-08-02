import { useMemo } from 'react';
import { from, Observable, ObservableInput } from 'rxjs';
import { useObservableState, ObservableStateReturnType } from './useObservableState';

/**
 * Convert an observable input to an observable
 */
export const useObservableInput = <T>(input: ObservableInput<T>): Observable<T> => {
    return useMemo(() => from(input), [input]);
};

/** Observe state of an observable input */
export const useObservableInputState = <T, E = unknown, I = undefined>(
    input: ObservableInput<T>,
    initial: I,
): ObservableStateReturnType<T | I, E> => {
    return useObservableState(useObservableInput(input), { initial });
};
