import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { Observable } from '../types';
import { useObservableLayoutSubscription } from './useObservableSubscription';

type ObservableStateOptions<S = undefined> = { initial: S; teardown?: VoidFunction };

export type ObservableStateReturnType<S, E = unknown> = {
    value: S;
    error: E | null;
    complete: boolean;
};

export function useObservableState<S>(
    subject: Observable<S>
): ObservableStateReturnType<S | undefined>;

/**
 * Hook for extracting state of observable.
 * **note** when state changes the consumer of the hook will rerender
 *
 * @param subject Observable subject
 * @param initial initial value
 * @returns current state of observable
 */
export function useObservableState<S, E = unknown, I = undefined>(
    subject: Observable<S>,
    opt: ObservableStateOptions<S> | ObservableStateOptions<I>
): ObservableStateReturnType<S | I, E>;

export function useObservableState<S, E = unknown, I = undefined>(
    subject: Observable<S>,
    opt: { initial: I; teardown?: VoidFunction }
): ObservableStateReturnType<S | I, E>;

export function useObservableState<S, E = unknown>(
    subject: Observable<S>,
    opt?: ObservableStateOptions<S>
): ObservableStateReturnType<S | undefined, E> {
    const [initialValue] = useState<S | undefined>(opt?.initial);

    const [next, setNext] = useState<S | undefined>(initialValue);
    const [error, setError] = useState<E | null>(null);
    const [complete, setComplete] = useState<boolean>(false);

    const resetState = useCallback(() => {
        setError(null);
        setNext(initialValue);
        setComplete(false);
    }, [setNext, setError, setComplete, initialValue]);

    useLayoutEffect(() => {
        const subjectValue = (subject as BehaviorSubject<S>).value;
        subjectValue && setNext(subjectValue);
        return resetState;
    }, [setNext, resetState, subject]);

    const subscriber = useMemo(
        () => ({
            next: setNext,
            error: setError,
            complete: () => setComplete(true),
        }),
        [setNext, setError, setComplete]
    );

    useObservableLayoutSubscription(subject, subscriber, opt?.teardown);

    return { value: next, error, complete };
}

export default useObservableState;
