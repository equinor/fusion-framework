import { useMemo, useRef, useSyncExternalStore } from 'react';
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
  /**
   * When `true`, the subject reference is frozen at the first render and the
   * store is never recreated, even if the caller passes a different observable
   * instance on subsequent renders. Use this as an escape hatch when the
   * subject cannot be memoized at the call site.
   *
   * @default false
   */
  persist?: boolean;
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
    /** caller-provided initial takes precedence */
    initial ??
    /** fall back to subject's synchronous current value if available */
    (hasStatefulValue(subject) ? subject.value : undefined)
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
      listeners.add(onStoreChange);

      const subscription = subject.subscribe({
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

      return (): void => {
        listeners.delete(onStoreChange);
        subscription.unsubscribe();
      };
    },
  };
}

/**
 * Subscribes to an {@link Observable} and returns its state.
 *
 * The initial `value` is `undefined` until the first emission.
 *
 * @param subject - Observable to subscribe to. Must have a stable reference.
 */
export function useObservableState<S, TError = unknown>(
  subject: Observable<S>,
): ObservableStateReturnType<S | undefined, TError>;

/**
 * Subscribes to an {@link Observable} and returns its state.
 *
 * @param subject - Observable to subscribe to. Must have a stable reference.
 * @param opt - Options including an optional `initial` value shown before the first emission.
 */
export function useObservableState<
  TType,
  TError = unknown,
  TInitial extends TType | undefined = undefined,
>(
  subject: Observable<TType>,
  opt: ObservableStateOptions<TInitial>,
): ObservableStateReturnType<TType | TInitial, TError>;

/**
 * Subscribes to a {@link StatefulObservable} (e.g. `BehaviorSubject`, `FlowSubject`)
 * and returns its state.
 *
 * The current `value` is read synchronously from the subject on mount,
 * so the initial state is never `undefined`.
 *
 * @param subject - Stateful observable to subscribe to. Must have a stable reference.
 */
export function useObservableState<TType, TError = unknown>(
  subject: StatefulObservable<TType>,
): ObservableStateReturnType<TType, TError>;

/**
 * Subscribes to a {@link StatefulObservable} (e.g. `BehaviorSubject`, `FlowSubject`)
 * and returns its state.
 *
 * @param subject - Stateful observable to subscribe to. Must have a stable reference.
 * @param opt - Options including an optional `initial` override and `teardown` callback.
 */
export function useObservableState<TType, TError = unknown>(
  subject: StatefulObservable<TType>,
  options: ObservableStateOptions<TType>,
): ObservableStateReturnType<TType, TError>;

/**
 * Subscribes to an observable and returns its latest emitted value as React
 * state. The component re-renders on every emission, error, or completion.
 *
 * Internally wraps `useSyncExternalStore` to guarantee tear-down safety and
 * concurrent-mode compatibility. The subscription is created once per unique
 * `subject` reference and cleaned up automatically when the component unmounts
 * or the subject changes.
 *
 * **`subject` must be stable (memoized).** Passing a new observable instance
 * on every render recreates the store and resets state on every render cycle.
 * Wrap the subject in `useMemo`, derive it outside the component, or pass
 * `opt.persist: true` to freeze the subject reference at first render.
 *
 * `opt.initial` and `opt.teardown` do **not** need to be memoized — they are
 * captured in refs and never trigger a store recreation on their own.
 *
 * @param subject - The observable to subscribe to. Must have a stable reference.
 * @param opt - Optional initial value and teardown callback.
 * @returns An object with `value`, `error`, and `complete` reflecting the latest observable state.
 *
 * @example
 * ```tsx
 * // Stable subject — created outside the component or wrapped in useMemo.
 * const subject = useMemo(() => new BehaviorSubject(0), []);
 *
 * function Counter() {
 *   const { value, error, complete } = useObservableState(subject, { initial: 0 });
 *
 *   if (error) return <p>Error: {String(error)}</p>;
 *   if (complete) return <p>Done: {value}</p>;
 *   return <p>Count: {value}</p>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Cannot memoize? Use persist to freeze the subject at first render.
 * function Widget({ stream }: { stream: Observable<number> }) {
 *   const { value } = useObservableState(stream, { persist: true });
 *   return <p>{value}</p>;
 * }
 * ```
 */
export function useObservableState<S, E = unknown>(
  subject: Observable<S> | StatefulObservable<S>,
  opt?: ObservableStateOptions<S>,
): ObservableStateReturnType<S | undefined, E> {
  const { initial, teardown, persist } = opt ?? {};

  // Refs keep initial/teardown out of useMemo deps — non-memoized caller values
  // (inline objects, arrow functions) would otherwise recreate the store on every render.
  const initialRef = useRef(initial);
  const teardownRef = useRef(teardown);

  // subjectRef freezes the subject when persist=true (store never recreated).
  // When persist=false (default), all refs are kept current so the store picks
  // up the latest values whenever the subject changes.
  const subjectRef = useRef(subject);
  if (!persist) {
    subjectRef.current = subject;
    initialRef.current = initial;
    teardownRef.current = teardown;
  }

  // persist=true  → stable ref identity → useMemo never re-runs
  // persist=false → live subject value   → useMemo re-runs on subject swap
  const stream = persist ? subjectRef.current : subject;

  const store = useMemo(
    () => createObservableStateStore<S, E>(stream, initialRef.current, teardownRef.current),
    [stream],
  );

  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return snapshot;
}

export default useObservableState;
