import { useMemo } from 'react';
import { from, type Observable, type ObservableInput } from 'rxjs';
import { useObservableState, type ObservableStateReturnType } from './useObservableState';

/**
 * React hook that converts an `ObservableInput` (Promise, Iterable, etc.) to
 * an RxJS `Observable`. The observable is memoised based on the input reference.
 *
 * @template T - The value type.
 * @param input - Any `ObservableInput<T>`.
 * @returns An `Observable<T>` wrapping the input.
 */
export const useObservableInput = <T>(input: ObservableInput<T>): Observable<T> => {
  return useMemo(() => from(input), [input]);
};

/**
 * React hook that subscribes to an `ObservableInput` and tracks its latest
 * value, error, and completion state.
 *
 * @template TType - The value type.
 * @template E - The error type.
 * @template TInitial - The initial value type.
 * @param input - Any `ObservableInput<TType>` (Promise, array, observable, etc.).
 * @param initial - An initial value to use before the first emission.
 * @returns An object with `value`, `error`, and `complete` properties.
 */
export function useObservableInputState<
  TType,
  E = unknown,
  TInitial extends TType | undefined = undefined,
>(input: ObservableInput<TType>, initial: TType): ObservableStateReturnType<TType | TInitial, E>;

/**
 * @see {@link useObservableInputState} — overload without a required initial value.
 */
export function useObservableInputState<
  TType,
  E = unknown,
  TInitial extends TType | undefined = undefined,
>(input: ObservableInput<TType>, initial?: TType): ObservableStateReturnType<TType | TInitial, E> {
  return useObservableState(useObservableInput(input), { initial });
}
