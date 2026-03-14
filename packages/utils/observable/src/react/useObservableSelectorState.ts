import { useObservableSelector } from './useObservableSelector';
import { useObservableState } from './useObservableState';
import type { Observable } from '../types';

/**
 * @deprecated Use `useObservableState(useObservableSelector(...))` instead (since ^8.1).
 * Will be removed in the next major version.
 *
 * React hook that selects a derived value from an observable and tracks
 * its state (value, error, complete).
 *
 * @template TType - The source value type.
 * @template TValue - The selected value type.
 * @param subject - The source observable.
 * @param selector - A function that projects each emitted value.
 * @param options - Optional initial value and equality comparator.
 * @returns An {@link ObservableStateReturnType} for the selected value.
 *
 * @example
 * ```tsx
 * // Preferred replacement:
 * const { value } = useObservableState(useObservableSelector(subject, (s) => s.name));
 * ```
 */
export function useObservableSelectorState<TType, TValue>(
  subject: Observable<TType>,
  selector: (state: TType) => TValue,
  options?: {
    initial?: TValue;
    compare?: (x: TValue, y: TValue) => boolean;
  },
) {
  const selector$ = useObservableSelector(subject, selector, options?.compare);
  return useObservableState(selector$, {
    initial: options?.initial,
  });
}
