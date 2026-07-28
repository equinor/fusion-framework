import { concatMap } from 'rxjs/operators';

import type { QueryQueueFn } from '../types';

/**
 * Takes a function that transforms each item in a queue and returns an Observable.
 * It processes each item one after another, waiting for the current item to complete before
 * moving on to the next one. This is useful when you need to maintain the order of tasks
 * and ensure that they are executed sequentially without overlapping.
 *
 * @param cb - A callback function that takes a `QueryQueueItem` and returns an Observable.
 * @returns A function that takes an Observable stream of `QueryQueueItem` and returns an Observable
 *          stream where each item is processed in sequence by the provided callback.
 */
export const concatQueue: QueryQueueFn = (...args) => (source$) => {
    // process queue items one after another, waiting for each to complete before starting the next
    return source$.pipe(concatMap(...args));
};
