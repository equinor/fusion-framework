import { useObservableSelector } from './useObservableSelector';
import { useObservableState } from './useObservableState';
import { Observable } from '../types';

/**
 * @deprecated use useObservableState (since ^8.1)
 *
 * will be removed in next major
 *
 * ```ts
 * const {value} = useObservableState(useObservableSelector(...));
 * ```
 *
 * Hook for extracting a property of an `Observable`
 * @param subject the subject to observe changes on
 * @param initial initial value of the state
 * @param selector the property of the subject state to observe
 * @param compare **Memoize** function for comparing difference
 * @returns Observable property of subject
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
