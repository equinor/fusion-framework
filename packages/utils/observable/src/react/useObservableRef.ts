import { useCallback, useRef } from 'react';
import type { BehaviorSubject } from 'rxjs';
import { useObservableLayoutSubscription } from './useObservableSubscription';
import type { Observable } from '../types';

/**
 * React hook that keeps a `ref` synchronised with the latest value from an
 * observable. The ref is updated via a layout-effect subscription so it is
 * always current during commit phase reads.
 *
 * If the observable is a `BehaviorSubject` (or any subject with a `.value`
 * property), the ref is initialised with that value.
 *
 * @template S - The value type.
 * @param subject - The observable to track.
 * @param initial - An optional initial value for the ref.
 * @returns A React ref whose `.current` mirrors the latest emitted value.
 *
 * @example
 * ```tsx
 * const countRef = useObservableRef(count$);
 * // countRef.current is always the latest emitted count
 * ```
 */
export const useObservableRef = <S>(
  subject: Observable<S>,
  initial?: S,
): React.RefObject<S | undefined> => {
  initial ??= (subject as BehaviorSubject<S>).value;
  const ref = useRef<S | undefined>(initial);
  useObservableLayoutSubscription(
    subject,
    useCallback((x: S) => {
      ref.current = x;
    }, []),
  );
  return ref;
};

export default useObservableRef;
