import { isObservable, type ObservableInput } from 'rxjs';

/**
 * Checks if the provided input is an ObservableInput<T>.
 *
 * ObservableInput<T> is a type that includes:
 *   - Observable<T>
 *   - InteropObservable<T>
 *   - PromiseLike<T>
 *   - ArrayLike<T>
 *   - Iterable<T>
 *   - AsyncIterable<T>
 *   - ReadableStreamLike<T>
 *
 * @template T The type of the value emitted or resolved by the input.
 * @param input The value to check.
 * @returns True if the input matches ObservableInput<T>, otherwise false.
 */
export function isObservableInput<T>(input: ObservableInput<T>): input is ObservableInput<T>;
// biome-ignore lint/suspicious/noExplicitAny: Should allow any input type
export function isObservableInput(input: any): input is ObservableInput<unknown>;
// biome-ignore lint/suspicious/noExplicitAny: Should allow any input type
export function isObservableInput(input: any): boolean {
  // Check for null or undefined
  if (input === null || input === undefined) {
    return false;
  }
  // Check for primitive string values (not ObservableInput)
  if (typeof input === 'string') {
    return false;
  }
  // Check if input is an RxJS Observable
  if (isObservable(input)) {
    return true;
  }
  // Check for InteropObservable (has Symbol.observable)
  if (typeof input[Symbol.observable] === 'function') {
    return true; // InteropObservable<T>
  }
  // Check for AsyncIterable (has Symbol.asyncIterator)
  if (typeof input[Symbol.asyncIterator] === 'function') {
    return true; // AsyncIterable<T>
  }
  // Check for PromiseLike (has then function)
  if (typeof input.then === 'function') {
    return true; // PromiseLike<T>
  }
  // Check for ArrayLike (object with length property)
  if (typeof input === 'object' && typeof input.length === 'number') {
    return true; // ArrayLike<T>
  }
  // Check for Iterable (has Symbol.iterator)
  if (typeof input[Symbol.iterator] === 'function') {
    return true; // Iterable<T>
  }
  // Check for ReadableStreamLike (has getReader function)
  if (typeof input.getReader === 'function') {
    return true; // ReadableStreamLike<T>
  }
  return false;
}
