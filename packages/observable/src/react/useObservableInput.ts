import { useMemo } from 'react';
import { from, Observable, ObservableInput } from 'rxjs';
import { useObservableState } from './useObservableState';

/**
 * Convert an observable input to an observable
 */
export const useObservableInput = <T>(input: ObservableInput<T>): Observable<T> => {
    return useMemo(() => from(input), [input]);
};

/** Observe state of an observable input */
export const useObservableInputState = <T>(
    input: ObservableInput<T>,
    initial?: T
): T | undefined => {
    return useObservableState(useObservableInput(input), initial);
};
