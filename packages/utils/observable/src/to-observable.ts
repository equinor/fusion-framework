import { from, of } from 'rxjs';
import type { ObservableInput, Observable } from 'rxjs';

import { isObservableInput } from './is-observable-input';

/**
 * Represents a value that can be:
 *   - a direct value of type T,
 *   - a function returning T (optionally accepting arguments),
 *   - or any ObservableInput<T> (Observable, Promise, Iterable, etc).
 *
 * @template T The value type.
 * @template TArgs The argument type(s) for the function variant.
 */
export type DynamicInputValue<T, TArgs> = T | ((...args: TArgs[]) => T) | ObservableInput<T>;

/**
 * Converts a dynamic input (value, function, or ObservableInput) to an RxJS Observable.
 *
 * Handles the following cases:
 * - If the input is an ObservableInput (Observable, Promise, Iterable, etc), it is converted using `from()`.
 * - If the input is a function, it is called with the provided arguments and the result is wrapped with `of()`.
 * - If the input is a plain object or primitive, it is wrapped with `of()`.
 *
 * @template T The value type to be emitted by the Observable.
 * @template TArgs The argument type(s) for the function variant.
 * @param input The dynamic input value to convert. Can be a value, function, or ObservableInput.
 * @param args Arguments to pass if the input is a function.
 * @returns An Observable emitting the value(s) from the input.
 * @throws If the input is not a supported type.
 *
 * @example
 * // ObservableInput
 * toObservable([1, 2, 3]).subscribe(x => console.log(x)); // 1, 2, 3
 * toObservable(Promise.resolve(42)).subscribe(x => console.log(x)); // 42
 *
 * // Object
 * toObservable({ key: 'value' }).subscribe(x => console.log(x)); // { key: 'value' }
 *
 * // Function
 * const fn = (x: number) => x * 2;
 * toObservable(fn, 5).subscribe(x => console.log(x)); // 10
 *
 * // Primitive
 * toObservable(42).subscribe(x => console.log(x)); // 42
 */
export function toObservable<T, TArgs>(
  input: DynamicInputValue<T, TArgs>,
  ...args: TArgs[]
): Observable<T> {
  // If input is already an ObservableInput (Observable, Promise, Iterable, etc), use RxJS 'from' to convert it
  if (isObservableInput(input)) {
    return from(input as ObservableInput<T>);
  }

  // If input is a function, call it with the provided arguments and wrap the result with 'of'
  if (typeof input === 'function') {
    const fn = input as (...args: TArgs[]) => T;
    const result = fn(...args);
    return isObservableInput(result) ? from(result as ObservableInput<T>) : of(result);
  }

  // Otherwise, treat input as a plain value or object and wrap it with 'of'
  return of(input as T);
}
