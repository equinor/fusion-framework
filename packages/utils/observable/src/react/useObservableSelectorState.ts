import { useObservableSelector } from './useObservableSelector';
import { ObservableStateReturnType, useObservableState } from './useObservableState';
import { Observable } from '../types';

/**
 * Hook for extracting a property of an `Observable`
 * @param subject the subject to observe changes on
 * @param initial initial value of the state
 * @param selector the property of the subject state to observe
 * @param compare **Memoize** function for comparing difference
 * @returns Observable property of subject
 */
export const useObservableSelectorState = <S, P extends keyof S, R = S[P], E = unknown>(
    subject: Observable<S>,
    selector: P | ((state: S) => R),
    initial?: R,
    compare?: (x: R, y: R) => boolean
): ObservableStateReturnType<R | undefined, E> =>
    useObservableState(useObservableSelector(subject, selector, compare), { initial });
