import { useMemo } from 'react';
import { from, Observable, ObservableInput } from 'rxjs';
import { useObservableState, ObservableStateReturnType } from './useObservableState';

/**
 * Convert an observable input to an observable
 */
export const useObservableInput = <T>(input: ObservableInput<T>): Observable<T> => {
    return useMemo(() => from(input), [input]);
};

export function useObservableInputState<TType, E = unknown>(
    input: ObservableInput<TType>,
    initial: TType,
): ObservableStateReturnType<TType, E>;

/** Observe state of an observable input */
export function useObservableInputState<TType, E = unknown>(
    input: ObservableInput<TType>,
    initial?: TType,
): ObservableStateReturnType<TType | undefined, E> {
    return useObservableState(useObservableInput(input), { initial });
}
