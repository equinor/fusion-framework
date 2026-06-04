import { useMemo, useSyncExternalStore } from 'react';
import { filter } from 'rxjs';
import type { Observable, StatefulObservable } from '../types';

/**
 * Options for {@link useObservableState}.
 *
 * @template TType - The initial value type (may be `undefined`).
 */
type ObservableStateOptions<TType = undefined> = {
  /** Value used before the first emission. */
  initial?: TType;
  /** Teardown function called when the subscription is unsubscribed. */
  teardown?: VoidFunction;
};

/**
 * Return type of {@link useObservableState}.
 *
 * @template TType - The value type.
 * @template TError - The error type.
 */
export type ObservableStateReturnType<TType, TError = unknown> = {
  /** The most recently emitted value. */
  value: TType;
  /** The most recent error, or `null`. */
  error: TError | null;
  /** Whether the observable has completed. */
  complete: boolean;
};

/**
 * Internal snapshot model used by `useSyncExternalStore`.
 *
 * @template TType - Observable value type.
 * @template TError - Observable error type.
 */
type ObservableStateSnapshot<TType, TError> = ObservableStateReturnType<TType | undefined, TError>;

/**
 * Internal store contract consumed by `useSyncExternalStore`.
 *
 * @template TType - Observable value type.
 * @template TError - Observable error type.
 */
type ObservableStateStore<TType, TError> = {
  /** Returns the current client snapshot. */
  getSnapshot: () => ObservableStateSnapshot<TType, TError>;
  /** Returns the current server snapshot. */
  getServerSnapshot: () => ObservableStateSnapshot<TType, TError>;
  /** Subscribes to store updates and returns an unsubscribe function. */
  subscribe: (onStoreChange: () => void) => () => void;
};

/**
 * Type guard for observables exposing a synchronous `value` property.
 *
 * @template TType - Observable value type.
 * @param subject - Observable candidate.
 * @returns `true` when the observable exposes a `value` field.
 */
function hasStatefulValue<TType>(
  subject: Observable<TType> | StatefulObservable<TType>,
): subject is StatefulObservable<TType> {
  return 'value' in (subject as object);
}

/**
 * Resolves the initial value for an observable snapshot.
 *
 * @template TType - Observable value type.
 * @param subject - Observable source.
 * @param initial - Optional initial value supplied by the caller.
 * @returns A resolved initial value, or `undefined`.
 */
function resolveInitialValue<TType>(
  subject: Observable<TType> | StatefulObservable<TType>,
  initial: TType | undefined,
): TType | undefined {
  return (
    /** provided initial value */
    initial ??
    /** use subject current value if supported */
    (hasStatefulValue(subject) ? subject.value : undefined) ??
    /** nothing to resolve */
    undefined
  );
}

/**
 * Creates a `useSyncExternalStore` adapter for observable state.
 *
 * @template TType - Observable value type.
 * @template TError - Observable error type.
 * @param subject - Observable source.
 * @param initial - Optional initial value supplied by the caller.
 * @param teardown - Optional teardown function added to the subscription.
 * @returns Store methods used by `useSyncExternalStore`.
 */
function createObservableStateStore<TType, TError = unknown>(
  subject: Observable<TType> | StatefulObservable<TType>,
  initial?: TType,
  teardown?: VoidFunction,
): ObservableStateStore<TType, TError> {
  let snapshot: ObservableStateSnapshot<TType, TError> = {
    value: resolveInitialValue(subject, initial),
    error: null,
    complete: false,
  };

  const listeners = new Set<() => void>();

  const notify = (): void => {
    listeners.forEach((listener) => {
      listener();
    });
  };

  const getSnapshot = (): ObservableStateSnapshot<TType, TError> => snapshot;

  return {
    getSnapshot,
    getServerSnapshot: getSnapshot,
    subscribe: (onStoreChange: () => void): (() => void) => {
      const subscription = subject
        .pipe(
          // `distinctUntilChanged` is not sufficient — it always emits the first value
          // (no previous to compare against). BehaviorSubject fires synchronously on
          // subscribe, so that first emission would update the snapshot before the listener
          // is registered. React's tearing check then sees a new object reference and forces
          // a re-render, which re-subscribes, which repeats indefinitely.
          // Comparing against `snapshot.value` is correct: it is already seeded via
          // resolveInitialValue, so the sync replay is caught, and subsequent duplicates
          // are suppressed for free.
          filter((value) => !Object.is(snapshot.value, value)),
        )
        .subscribe({
        next: (value) => {
          snapshot = { ...snapshot, value };
          notify();
        },
        error: (error) => {
          snapshot = { ...snapshot, error: error as TError };
          notify();
        },
        complete: () => {
          snapshot = { ...snapshot, complete: true };
          notify();
        },
      });

      subscription.add(teardown);

      /**
       * Add the listener AFTER subscribing so that synchronous emissions from
       * stateful observables (BehaviorSubject, FlowSubject) don't call
       * onStoreChange during the subscribe call itself — React forbids this and
       * it causes a re-render / tearing loop.
       */
      listeners.add(onStoreChange);

      return (): void => {
        listeners.delete(onStoreChange);
        subscription.unsubscribe();
      };
    },
  };
}

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
  const { initial, teardown } = opt ?? {};
  const store = useMemo(
    () => createObservableStateStore<S, E>(subject, initial, teardown),
    [subject, initial, teardown],
  );

  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return snapshot;
}

export default useObservableState;
