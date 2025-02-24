import { useEffect, useLayoutEffect } from 'react';
import type { Observable, Observer } from 'rxjs';

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
