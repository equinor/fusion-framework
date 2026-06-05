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
    // caller wins over subject's current value
    initial ??
    // read synchronous value from stateful subjects (BehaviorSubject, FlowSubject)
    (hasStatefulValue(subject) ? subject.value : undefined) ??
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
          // Stateful observables (BehaviorSubject, FlowSubject) emit their current value
          // synchronously on subscribe. useSyncExternalStore compares getSnapshot() before
          // and after the subscribe call; a new snapshot object causes a tearing mismatch,
          // which forces a re-render → re-subscribe → infinite loop.
          //
          // We compare against snapshot.value (already seeded by resolveInitialValue) so
          // the replayed current value is dropped. Subsequent duplicate emissions are
          // suppressed for free — distinctUntilChanged cannot do this because it always
          // passes the first emission through.
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

      // Register the listener only after subscribing. The filter above drops the
      // synchronous replay, but adding the listener first would still cause
      // onStoreChange to be called inside subscribe — React forbids this.
      listeners.add(onStoreChange);

      return (): void => {
        listeners.delete(onStoreChange);
        subscription.unsubscribe();
      };
    },
  };
}

/**
 * Subscribes to an {@link Observable} and returns its current state.
 *
 * @param subject - Observable to subscribe to.
 */
export function useObservableState<S, TError = unknown>(
  subject: Observable<S>,
): ObservableStateReturnType<S | undefined, TError>;

/**
 * Subscribes to an {@link Observable} and returns its current state.
 *
 * @param subject - Observable to subscribe to.
 * @param opt - Options including an optional initial value and teardown callback.
 */
export function useObservableState<
  TType,
  TError = unknown,
  TInitial extends TType | undefined = undefined,
>(
  subject: Observable<TType>,
  opt: ObservableStateOptions<TInitial>,
): ObservableStateReturnType<TType | TInitial, TError>;

// --- StatefulObservable overloads (BehaviorSubject, FlowSubject) ---
// The initial value is read synchronously from subject.value on mount.

/**
 * Subscribes to a {@link StatefulObservable} and returns its current state.
 * The initial value is read synchronously from `subject.value`.
 *
 * @param subject - Stateful observable (e.g. `BehaviorSubject`, `FlowSubject`).
 */
export function useObservableState<TType, TError = unknown>(
  subject: StatefulObservable<TType>,
): ObservableStateReturnType<TType, TError>;

/**
 * Subscribes to a {@link StatefulObservable} and returns its current state.
 *
 * @param subject - Stateful observable (e.g. `BehaviorSubject`, `FlowSubject`).
 * @param options - Options including an optional override initial value and teardown callback.
 */
export function useObservableState<TType, TError = unknown>(
  subject: StatefulObservable<TType>,
  options: ObservableStateOptions<TType>,
): ObservableStateReturnType<TType, TError>;

/**
 * Hook that subscribes to an observable and exposes its state to a React component.
 * Re-renders the consumer whenever a new value, error, or completion is emitted.
 *
 * @param subject - Observable or stateful observable to subscribe to.
 * @param opt - Optional initial value and teardown callback.
 * @returns Current `{ value, error, complete }` snapshot.
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
