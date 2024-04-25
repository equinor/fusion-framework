import type { Observable } from 'rxjs';
import { concatMap, map, mergeMap, switchMap } from 'rxjs/operators';

import type { Query } from './Query';

import type { QueryQueueFn } from './types';

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
export const concatQueue: QueryQueueFn =
    (...args) =>
    (source$) =>
        source$.pipe(concatMap(...args));

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
        source$.pipe(mergeMap(...args));

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
        source$.pipe(switchMap(...args));

/**
 * Transforms an Observable stream of `QueryTaskValue<TType>` into an Observable stream of `TType`.
 * It extracts the `value` property from each `QueryTaskValue<TType>` in the stream.
 *
 * @param source$ - An Observable stream of `QueryTaskValue<TType>`.
 * @returns An Observable stream of `TType` where each emitted item is the `value` property from the input stream.
 */
export const queryValue = <TType, TArgs>(
    source$: ReturnType<Query<TType, TArgs>['query']>,
): Observable<TType> => source$.pipe(map((entry) => entry.value));
