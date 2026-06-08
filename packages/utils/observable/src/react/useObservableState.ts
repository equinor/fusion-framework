import {
  type DependencyList,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { BehaviorSubject, type Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import type { Observable, StatefulObservable } from '../types';

/**
 * Options for {@link useObservableState}.
 *
 * @template TType - The initial value type (may be `undefined`).
 */
type ObservableStateOptions<TType = undefined> = {
  /**
   * Value exposed until the observable emits its first value.
   *
   * The initial value is read when the internal state stream is created and is
   * not treated as a subscription dependency. Passing a new object literal on
   * later renders does not recreate the subscription.
   */
  initial?: TType;
  /**
   * Teardown function added to the active observable subscription.
   *
   * The latest callback is used when a subscription is created, but changing the
   * callback alone does not recreate the subscription.
   */
  teardown?: VoidFunction;
  /**
   * React-style dependency list that controls when the observable subscription
   * is recreated.
   *
   * When omitted, the hook follows the `subject` reference. Passing `[]` keeps
   * the first subject for the component lifetime. Passing custom dependencies
   * lets callers recreate non-memoized subjects during render while only
   * resubscribing when the selected dependency values change.
   */
  deps?: DependencyList;
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
 * Compares React-style dependency lists with `Object.is` semantics.
 *
 * @param previous - Previous dependency list, or `null` before the first subscription.
 * @param next - Next dependency list to compare.
 * @returns `true` when the dependency lists are equivalent.
 */
function areDependenciesEqual(previous: DependencyList | null, next: DependencyList): boolean {
  return (
    previous !== null &&
    previous.length === next.length &&
    previous.every((value, index) => Object.is(value, next[index]))
  );
}

/**
 * Compares observable state snapshots by the fields exposed from the hook.
 *
 * @template TType - Observable value type.
 * @template TError - Observable error type.
 * @param previous - Previous observable state snapshot.
 * @param next - Next observable state snapshot.
 * @returns `true` when the hook state is unchanged.
 */
function areObservableStateSnapshotsEqual<TType, TError>(
  previous: ObservableStateSnapshot<TType, TError>,
  next: ObservableStateSnapshot<TType, TError>,
): boolean {
  return (
    Object.is(previous.value, next.value) &&
    Object.is(previous.error, next.error) &&
    previous.complete === next.complete
  );
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
 * By default, the subscription follows the `subject` reference, matching the
 * original hook contract: callers should pass a stable observable or expect a
 * resubscription when the observable reference changes. When an observable is
 * intentionally recreated during render, pass `opt.deps` to describe the real
 * lifecycle of the subscription. For example, `deps: []` subscribes to the
 * first subject for the lifetime of the component, while `deps: [id]`
 * resubscribes only when `id` changes.
 *
 * `opt.initial` and `opt.teardown` do **not** need to be memoized and do not
 * trigger a subscription recreation on their own.
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
 * // Cannot memoize the observable instance? Describe the real subscription lifetime.
 * function Widget({ stream, widgetId }: { stream: Observable<number>; widgetId: string }) {
 *   const { value } = useObservableState(stream, { deps: [widgetId] });
 *   return <p>{value}</p>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Subscribe to the first observable for the component lifetime.
 * function StaticWidget({ stream }: { stream: Observable<number> }) {
 *   const { value } = useObservableState(stream, { deps: [] });
 *   return <p>{value}</p>;
 * }
 * ```
 */
export function useObservableState<S, E = unknown>(
  subject: Observable<S> | StatefulObservable<S>,
  opt?: ObservableStateOptions<S>,
): ObservableStateReturnType<S | undefined, E> {
  const { initial, teardown, deps } = opt ?? {};

  const subscribedRef = useRef<Subscription | null>(null);
  const depsRef = useRef<DependencyList | null>(null);
  const teardownRef = useRef(teardown);
  teardownRef.current = teardown;

  const [stream] = useState(
    () =>
      new BehaviorSubject({
        value: resolveInitialValue(subject, initial),
        error: null,
        complete: false,
      } as ObservableStateSnapshot<S, E>),
  );

  useLayoutEffect(() => {
    const subscriptionDeps = deps ?? [subject];
    if (areDependenciesEqual(depsRef.current, subscriptionDeps)) {
      return;
    }

    depsRef.current = subscriptionDeps;

    if (subscribedRef.current) {
      subscribedRef.current.unsubscribe();
    }

    subscribedRef.current = subject.subscribe({
      next: (value) => {
        stream.next({ value, error: null, complete: false });
      },
      error: (error) => {
        stream.next({ value: stream.value?.value, error, complete: false });
      },
      complete: () => {
        stream.next({
          value: stream.value?.value,
          error: stream.value?.error ?? null,
          complete: true,
        });
      },
    });
    subscribedRef.current.add(teardownRef.current);
  });

  useLayoutEffect(() => {
    return () => {
      subscribedRef.current?.unsubscribe();
    };
  }, []);

  const onStoreChange = useCallback(
    (cb: VoidFunction) => {
      const subscription: Subscription = stream
        .pipe(distinctUntilChanged(areObservableStateSnapshotsEqual))
        .subscribe(cb);
      return () => subscription.unsubscribe();
    },
    [stream],
  );

  const getSnapshot = useCallback(() => stream.value as ObservableStateSnapshot<S, E>, [stream]);

  return useSyncExternalStore(onStoreChange, getSnapshot);
}

export default useObservableState;
