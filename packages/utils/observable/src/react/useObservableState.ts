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
 * @param initial initial value
 * @returns current state of observable
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
