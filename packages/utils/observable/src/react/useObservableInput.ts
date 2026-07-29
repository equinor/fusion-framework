import { useMemo } from 'react';
import { from, type Observable, type ObservableInput } from 'rxjs';

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
