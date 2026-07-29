import { switchMap } from 'rxjs/operators';

import type { QueryQueueFn } from '../types';

/**
 * Takes a function that transforms each item in a queue and returns an Observable.
 * It processes each item by cancelling the current task if a new one arrives.
 * This is useful when only the result of the latest task is relevant and previous
 * tasks can be safely discarded.
 *
 * @param cb - A callback function that takes a `QueryQueueItem` and returns an Observable.
 * @returns A function that takes an Observable stream of `QueryQueueItem` and returns an Observable
 *          stream where each item is processed by the provided callback, but only the latest
 *          item's result is emitted.
 */
export const switchQueue: QueryQueueFn =
  (...args) =>
  (source$) =>
    // cancel the previous in-flight item whenever a new item arrives
    source$.pipe(switchMap(...args));
