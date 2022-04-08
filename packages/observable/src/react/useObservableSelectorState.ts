import { useObservableSelector } from './useObservableSelector';
import { useObservableState } from './useObservableState';
import { Observable } from '../types';

/**
 * Hook for extracting a property of an `Observable`
 * @param subject the subject to observe changes on
 * @param initial initial value of the state
 * @param selector the property of the subject state to observe
 * @param compare **Memoize** function for comparing difference
 * @returns Observable property of subject
 */
export const useObservableSelectorState = <S, P extends keyof S, R = S[P]>(
    subject: Observable<S>,
    selector: P | ((state: S) => R),
    initial?: R,
    compare?: (x: R, y: R) => boolean
): R | undefined => useObservableState(useObservableSelector(subject, selector, compare), initial);
