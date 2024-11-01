import { StatefulObservable } from '../types';
import { Observable, ObservableInput } from 'rxjs';
import { useObservableExternalStore } from './useObservableExternalStore';
import { useState } from 'react';

type ObservableStateOptions<TType = undefined> = {
    initial?: TType;
    teardown?: VoidFunction;
};

export type ObservableStateReturnType<TType, TError = unknown> = {
    value: TType;
    error?: TError;
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
    source: ObservableInput<S>,
    opt?: ObservableStateOptions<S>,
): ObservableStateReturnType<S | undefined, E> {
    type TReturn = ObservableStateReturnType<S | undefined, E>;
    // resolve initial value
    const [initial] = useState(() => {
        // if initial value is provided return it
        if (opt?.initial !== undefined) return opt.initial;
        // if the source is a stateful observable (BehaviorSubject) return the value
        return 'value' in source ? (source as StatefulObservable<S>).value : undefined;
    });

    return useObservableExternalStore(source, initial) as TReturn;
}

export default useObservableState;
