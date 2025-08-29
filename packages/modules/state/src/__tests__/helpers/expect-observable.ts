import { firstValueFrom, from, lastValueFrom, tap, type ObservableInput } from 'rxjs';
import { type Assertion, expect } from 'vitest';

/**
 * Asserts the emitted value(s) from an observable input using Vitest's `expect`.
 *
 * Depending on the `options`, it will either assert the first or last emitted value.
 *
 * @template T - The type of values emitted by the observable.
 * @param input - The observable or observable-like input to be tested.
 * @param options - Optional configuration object.
 * @param options.first_value - If `true`, asserts the first emitted value; otherwise, asserts the last emitted value.
 * @returns A Vitest assertion object for the emitted value.
 */
export function expectObservable<T>(
  input: ObservableInput<T>,
  options?: { first_value?: boolean },
): Assertion<T> {
  const operator = options?.first_value ? firstValueFrom : lastValueFrom;
  return expect(operator(from(input).pipe(tap((value) => console.log('Emitted value:', value)))));
}

export default expectObservable;
