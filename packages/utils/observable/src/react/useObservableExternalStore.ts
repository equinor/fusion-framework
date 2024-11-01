import { useCallback, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { type ObservableInput, BehaviorSubject, from } from 'rxjs';

import type { StatefulObservable } from '../types';

/**
 * Represents the state of an observable external store.
 *
 * @template S - The type of the value emitted by the observable source.
 * @template E - The type of the error emitted by the observable source.
 */
type ObservableExternalStoreState<S, E = unknown> = {
    /** last emitted value from observable source */
    value: S;
    /** indicates that the observable source has errored */
    error?: E;
    /** indicates that the observable source has completed */
    complete?: boolean;
};

type ObservableExternalStoreOptions<TValue, TInitial extends TValue | undefined> = {
    /**
     * Operator to only emit distinct values from the source.
     *
     * @param newValue the suggested new value
     * @param currentValue the current value
     * @returns boolean indicating whether the new value should be rejected
     */
    compare?: (newValue: TValue, currentValue?: TValue | TInitial) => boolean;
    teardown?: VoidFunction;
};

const defaultCompare = <TValue>(newValue: TValue, prevValue?: TValue): boolean =>
    newValue === prevValue;

/**
 * A custom hook that subscribes to an observable source and integrates it with React's state management.
 *
 * @note
 * - `initial` will use only the first provided value, and ignore any subsequent values.
 * - `source` must be memoized.
 * - `compare` must be memorized (defaults to strict equality).
 * - `teardown` must be memorized.
 *
 * @see {@link https://react.dev/reference/react/useSyncExternalStore | React useSyncExternalStore}
 *
 * @example
 * ```ts
 * const source = useMemo(() => of(1), []);
 * const { value } = useObservableExternalStore(source);
 * console.log(value); // 1
 * ```
 *
 * @example
 * ```ts
 * // example with default value
 * const source = useMemo(() => new Subject(), []);
 * const { value } = useObservableExternalStore(source, 0);
 * console.log(value); // 0 then 1 after rerender
 * useEffect(() => source.next(1), [value]);
 * ```
 *
 * @example
 * ```ts
 * // example with teardown
 * const abortController = useMemo(() => new AbortController(), []);
 * const teardown = useCallback(() => abortController.abort(), [abortController]);
 * const source = useMemo(() => from(fetch('https://api.com', { signal: abortController.signal })), [abortController.signal]);
 * const { value, error } = useObservableExternalStore(source, undefined, { teardown });
 * ```
 *
 * @example
 * ```ts
 * // example with custom compare
 * const source = useMemo(() => new Subject(), []);
 * const compare = useCallback((newValue, prevValue) => newValue.id === prevValue.id, []);
 * const { value } = useObservableExternalStore(source, { id: 1 }, { compare });
 * console.log(value); // { id: 1 }
 * useEffect(() => source.next({ id: 1, name: 'foo' }), [value]); // no change
 * useEffect(() => source.next({ id: 2, name: 'foo' }), [value]); // { id: 2, name: 'foo' }
 * ```
 *
 *
 * @template TValue - The type of the value emitted by the observable.
 * @template TError - The type of the error emitted by the observable. Defaults to `unknown`.
 * @template TInitial - The type of the initial value. Defaults to `undefined`.
 *
 * @param {ObservableInput<TValue>} source - The observable source to subscribe to.
 * @param {TInitial} [initial] - The initial value to be used before the observable emits any values.
 * @param {ObservableExternalStoreOptions<TValue, TInitial>} [options] - Optional configuration for the store.
 * @param {function} [options.compare] - A custom compare function to determine if the value has changed.
 *
 * @returns {ObservableExternalStoreState<TValue | TInitial, TError>} The current state of the observable store.
 */
export function useObservableExternalStore<
    TValue,
    TError = unknown,
    TInitial extends TValue | undefined = undefined,
>(
    source: ObservableInput<TValue> | StatefulObservable<TValue>,
    initial?: TInitial,
    options?: ObservableExternalStoreOptions<TValue, TInitial>,
): ObservableExternalStoreState<TValue | TInitial, TError> {
    // Store the initial value in a memoized state.
    const [initialValue] = useState<TInitial>(() => {
        if (initial !== undefined) {
            return initial;
        }
        if ('value' in source) {
            return source.value as TInitial;
        }
        return undefined as TInitial;
    });

    // Create a BehaviorSubject to store the current state of the observable.
    const [state$] = useState(
        () =>
            new BehaviorSubject<ObservableExternalStoreState<TInitial | TValue, TError>>({
                value: initialValue,
            }),
    );

    // Extract the compare function from the options, or use the default compare function.
    const compare = options?.compare ?? defaultCompare;
    const teardown = options?.teardown;

    // Memoize the connectSource function to prevent unnecessary re-subscriptions.
    const connectSource = useCallback(
        (source: ObservableInput<TValue>): VoidFunction => {
            const subscription = from(source).subscribe({
                next: (value) => {
                    // only update the state if the new value is different from the previous value
                    if (!compare(value, state$.value.value)) {
                        state$.next({ ...state$.value, value });
                    }
                },
                error: (error) => {
                    state$.next({ ...state$.value, error });
                },
                complete: () => {
                    state$.next({ ...state$.value, complete: true });
                },
            });
            subscription.add(teardown);
            return () => subscription.unsubscribe();
        },
        [state$, compare, teardown],
    );

    // When the source changes, connect to the new source.
    useLayoutEffect(() => connectSource(source), [connectSource, source]);

    /**
     * A function that takes a single callback argument and subscribes it to the store.
     * When the store changes, it should invoke the provided callback,
     * which will cause React to re-call getSnapshot and (if needed) re-render the component.
     * The subscribe function should return a function that cleans up the subscription.
     */
    const subscribe = useCallback((subscriber: VoidFunction): VoidFunction => {
        const subscription = state$.subscribe(subscriber);
        return () => subscription.unsubscribe();
    }, []);

    /**
     * A function that returns a snapshot of the data in the store that’s needed by the component.
     * While the store has not changed, repeated calls to getSnapshot must return the same value.
     */
    const getSnapshot = useCallback(() => state$.value, [state$]);

    /**
     * A function that returns the initial snapshot of the data in the store.
     * It will be used only during server rendering and during hydration of server-rendered content on the client.
     */
    const getServerSnapshot = useCallback(
        () => ({
            value: initialValue,
        }),
        [initialValue],
    );

    // use React's useSyncExternalStore hook to manage the store's state.
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useObservableExternalStore;
