import { useMemo } from 'react';
import { from, type Observable, type ObservableInput } from 'rxjs';
import { useObservableState, type ObservableStateReturnType } from './useObservableState';

/**
 * Convert an observable input to an observable
 */
export const useObservableInput = <T>(input: ObservableInput<T>): Observable<T> => {
  return useMemo(() => from(input), [input]);
};

export function useObservableInputState<
  TType,
  E = unknown,
  TInitial extends TType | undefined = undefined,
>(input: ObservableInput<TType>, initial: TType): ObservableStateReturnType<TType | TInitial, E>;

/** Observe state of an observable input */
export function useObservableInputState<
  TType,
  E = unknown,
  TInitial extends TType | undefined = undefined,
>(input: ObservableInput<TType>, initial?: TType): ObservableStateReturnType<TType | TInitial, E> {
  return useObservableState(useObservableInput(input), { initial });
}
