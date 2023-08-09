import { useLayoutEffect, useMemo, useState } from 'react';
import { Observable, StatefulObservable } from '../types';
import { useObservableLayoutSubscription } from './useObservableSubscription';

type ObservableStateOptions<TType = undefined> = {
    initial?: TType;
    teardown?: VoidFunction;
};

export type ObservableStateReturnType<TType, TError = unknown> = {
    value: TType;
    error: TError | null;
    complete: boolean;
};

/**
 * use state of observable
 * @param subject [dep] Observable subject
 */
export function useObservableState<S, TError = unknown>(
    subject: Observable<S>,
): ObservableStateReturnType<S | undefined, TError>;

/**
 * use state of observable
 * @param subject [dep] Observable subject
 */
export function useObservableState<
    TType,
    TError = unknown,
    TInitial extends TType | undefined = undefined,
>(
    subject: Observable<TType>,
    opt: ObservableStateOptions<TInitial>,
): ObservableStateReturnType<TType | TInitial, TError>;

/** === StatefulObservable === */

/**
 * use state of observable with value property (`FlowSubject`, `BehaviorSubject`)
 * @param subject [dep] Observable subject
 */
export function useObservableState<TType, TError = unknown>(
    subject: StatefulObservable<TType>,
): ObservableStateReturnType<TType, TError>;

/**
 * use state of observable with value property (`FlowSubject`, `BehaviorSubject`)
 * @param subject [dep] Observable subject
 */
export function useObservableState<TType, TError = unknown>(
    subject: StatefulObservable<TType>,
    options: ObservableStateOptions<TType>,
): ObservableStateReturnType<TType, TError>;

/**
 * Hook for extracting state of observable.
 * **note** when state changes the consumer of the hook will rerender
 *
 * @param subject [dep] Observable subject
 * @param initial initial value
 * @returns current state of observable
 */
export function useObservableState<S, E = unknown>(
    subject: Observable<S> | StatefulObservable<S>,
    opt?: ObservableStateOptions<S>,
): ObservableStateReturnType<S | undefined, E> {
    const [next, setNext] = useState<S | undefined>(() => {
        return opt?.initial ? ('value' in subject ? subject.value : opt.initial) : undefined;
    });
    const [error, setError] = useState<E | null>(null);
    const [complete, setComplete] = useState<boolean>(false);

    useLayoutEffect(() => {
        setError(null);
        setComplete(false);
        setNext('value' in subject ? (subject as StatefulObservable<S>).value : undefined);
    }, [setNext, setError, setComplete, subject]);

    const subscriber = useMemo(
        () => ({
            next: setNext,
            error: setError,
            complete: () => setComplete(true),
        }),
        [setNext, setError, setComplete],
    );

    useObservableLayoutSubscription(subject, subscriber, opt?.teardown);

    return { value: next, error, complete };
}

export default useObservableState;
