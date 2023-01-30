import { useMemo, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { Observable } from '../types';
import { useObservableLayoutSubscription } from './useObservableSubscription';

type ObservableStateOptions<S> = { initial?: S; teardown?: VoidFunction };

type ObservableStateReturnType<S, E = unknown> = {
    next: S;
    error: E | null;
    complete: boolean;
};

export function useObservableState<S>(subject: Observable<S>): ObservableStateReturnType<S>;

/**
 * Hook for extracting state of observable.
 * **note** when state changes the consumer of the hook will rerender
 *
 * @param subject Observable subject
 * @param opt ObservableStateOptions with options for initial state and a teardown function.
 * @returns {next, error, complete} where 'next' is current state of observable, 'error' is Error object or undefined, 'complete' is a boolean of the observable's loading state
 */
export function useObservableState<S, E = unknown>(
    subject: Observable<S>,
    opt?: ObservableStateOptions<S>
): ObservableStateReturnType<S, E>;

export function useObservableState<S, E = unknown>(
    subject: Observable<S>,
    opt?: ObservableStateOptions<S>
): ObservableStateReturnType<S | undefined, E> {
    const initial = opt?.initial ?? (subject as BehaviorSubject<S>).value;
    const [next, setNext] = useState<S | undefined>(initial);
    const [error, setError] = useState<E | null>(null);
    const [complete, setComplete] = useState<boolean>(false);

    useObservableLayoutSubscription(
        subject,
        useMemo(() => ({ next: setNext, error: setError, complete: () => setComplete(true) }), []),
        opt?.teardown
    );
    return { next, error, complete };
}

export default useObservableState;
