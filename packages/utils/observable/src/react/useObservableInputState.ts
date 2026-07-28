import type { ObservableInput } from 'rxjs';
import { useObservableState, type ObservableStateReturnType } from './useObservableState';
import { useObservableInput } from './useObservableInput';

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
 * React hook that subscribes to an `ObservableInput` and tracks its latest
 * value, error, and completion state.
 *
 * @template TType - The value type.
 * @template E - The error type.
 * @template TInitial - The initial value type.
 * @param input - Any `ObservableInput<TType>` (Promise, array, observable, etc.).
 * @param initial - An optional initial value to use before the first emission.
 * @returns An object with `value`, `error`, and `complete` properties.
 */
export function useObservableInputState<
  TType,
  E = unknown,
  TInitial extends TType | undefined = undefined,
>(input: ObservableInput<TType>, initial?: TType): ObservableStateReturnType<TType | TInitial, E> {
  return useObservableState(useObservableInput(input), { initial });
}
