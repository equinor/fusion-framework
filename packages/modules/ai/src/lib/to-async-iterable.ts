import type { Observable } from 'rxjs';

/**
 * Convert an RxJS `Observable` into an `AsyncIterable`.
 *
 * This bridge allows Observable-based service streams to be consumed with
 * `for await...of` loops or as LangChain `AsyncGenerator` iterators.
 *
 * @template T - The element type emitted by the observable.
 * @param observable - The source observable to adapt.
 * @returns An `AsyncIterable` that yields each value emitted by the observable.
 */
export function toAsyncIterable<T>(observable: Observable<T>): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      const queue: IteratorResult<T>[] = [];
      let done = false;
      let resolveNext: ((value: IteratorResult<T>) => void) | null = null;
      let rejectNext: ((error: unknown) => void) | null = null;

      // Subscribe to the Observable
      const subscription = observable.subscribe({
        next(value) {
          // Deliver directly to an already-waiting consumer, otherwise buffer for later
          if (resolveNext) {
            resolveNext({ value, done: false });
            resolveNext = null;
          } else {
            queue.push({ value, done: false });
          }
        },
        error(err) {
          done = true;
          // Reject the waiting consumer immediately if one exists
          if (rejectNext) {
            rejectNext(err);
            rejectNext = null;
          }
        },
        complete() {
          done = true;
          // Signal completion to an already-waiting consumer, otherwise buffer it
          if (resolveNext) {
            resolveNext({ value: undefined, done: true });
            resolveNext = null;
          } else {
            queue.push({ value: undefined, done: true });
          }
        },
      });

      return {
        async next(): Promise<IteratorResult<T>> {
          // Return queued value if available
          if (queue.length > 0) {
            return queue.shift() as IteratorResult<T>;
          }
          // If Observable is complete, return done
          if (done) {
            return { value: undefined, done: true };
          }
          // Wait for the next value
          return new Promise<IteratorResult<T>>((resolve, reject) => {
            resolveNext = resolve;
            rejectNext = reject;
          });
        },
        return() {
          // Clean up subscription on early termination
          subscription.unsubscribe();
          return Promise.resolve({ value: undefined, done: true });
        },
        throw(err) {
          // Handle errors
          subscription.unsubscribe();
          return Promise.reject(err);
        },
      };
    },
  };
}
