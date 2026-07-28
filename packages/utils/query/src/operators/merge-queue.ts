import { mergeMap } from 'rxjs/operators';

import type { QueryQueueFn } from '../types';

/**
 * Takes a function that transforms each item in a queue and returns an Observable.
 * It processes each item concurrently, potentially leading to out-of-order execution.
 * This is useful when the order of tasks is not important and you want to maximize
 * throughput by running tasks in parallel.
 *
 * @param cb - A callback function that takes a `QueryQueueItem` and returns an Observable.
 * @returns A function that takes an Observable stream of `QueryQueueItem` and returns an Observable
 *          stream where each item is processed concurrently by the provided callback.
 */
export const mergeQueue: QueryQueueFn =
  (...args) =>
  (source$) =>
    source$
      // process all queue items concurrently, without waiting for previous items to complete
      .pipe(mergeMap(...args));
