import type { Observable } from 'rxjs';

// Function to convert Observable to AsyncIterable
export function toAsyncIterable<T>(observable: Observable<T>): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      const queue: IteratorResult<T>[] = [];
      let done = false;
      let resolveNext: ((value: IteratorResult<T>) => void) | null = null;
      let rejectNext: (((error: unknown) => void) | null) = null;

      // Subscribe to the Observable
      const subscription = observable.subscribe({
        next(value) {
          if (resolveNext) {
            // If there's a waiting consumer, resolve immediately
            resolveNext({ value, done: false });
            resolveNext = null;
          } else {
            // Otherwise, queue the value
            queue.push({ value, done: false });
          }
        },
        error(err) {
          done = true;
          if (rejectNext) {
            rejectNext(err);
            rejectNext = null;
          }
        },
        complete() {
          done = true;
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
          if (queue.length > 0) {
            // Return queued value if available
            return queue.shift() as IteratorResult<T>;
          }
          if (done) {
            // If Observable is complete, return done
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
