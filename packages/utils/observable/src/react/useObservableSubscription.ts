import { useEffect, useLayoutEffect } from 'react';
import type { Observable, Observer } from 'rxjs';

/**
 * React hook that subscribes to an observable using `useEffect`.
 *
 * The subscription is created when the observable or observer changes, and
 * torn down on unmount or re-subscription.
 *
 * @template T - The value type emitted by the observable.
 * @param observable - The observable to subscribe to.
 * @param observer - An observer or `next` callback.
 * @param teardown - Optional teardown function added to the subscription.
 */
export const useObservableSubscription = <T>(
  observable: Observable<T>,
  observer?: Partial<Observer<T>> | ((value: T) => void),
  teardown?: () => void,
): void => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: teardown should not trigger rerender
  useEffect(() => {
    const subscription = observable.subscribe(observer as Partial<Observer<T>>);
    subscription.add(teardown);
    return () => subscription.unsubscribe();
  }, [observable, observer]);
};

/**
 * React hook that subscribes to an observable using `useLayoutEffect`,
 * ensuring the subscription is active before the browser paints.
 *
 * Useful when the observable drives ref updates or other commit-phase side effects.
 *
 * @template T - The value type emitted by the observable.
 * @param observable - The observable to subscribe to.
 * @param observer - An observer or `next` callback.
 * @param teardown - Optional teardown function added to the subscription.
 */
export const useObservableLayoutSubscription = <T>(
  observable: Observable<T>,
  observer?: Partial<Observer<T>> | ((value: T) => void),
  teardown?: () => void,
): void => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: teardown should not trigger rerender
  useLayoutEffect(() => {
    const subscription = observable.subscribe(observer as Partial<Observer<T>>);
    subscription.add(teardown);
    return () => subscription.unsubscribe();
  }, [observable, observer]);
};
