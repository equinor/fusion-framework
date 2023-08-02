import { useMemo } from 'react';
import { Observable } from '../types';
import { pluck, distinctUntilChanged, map } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

const selectorFn = <S, P extends keyof S, R = S[P]>(
    subject: Observable<S>,
    selector: P | ((state: S) => R),
    compare?: (x: R, y: R) => boolean,
): Observable<R> => {
    const selectorFn = typeof selector === 'function' ? map<S, R>(selector) : pluck<S, P>(selector);
    return subject.pipe(
        selectorFn as unknown as OperatorFunction<S, R>,
        distinctUntilChanged(compare),
    );
};

/**
 * Hook for observing a property of an object
 * @param subject the subject to observe changes on
 * @param selector the property of the subject state to observe
 * @param compare function for comparing difference
 * @returns Observable property of subject
 */
export const useObservableSelector = <S, P extends keyof S, R = S[P]>(
    subject: Observable<S>,
    selector: P | ((state: S) => R),
    compare?: (x: R, y: R) => boolean,
): Observable<R> =>
    useMemo(() => selectorFn(subject, selector, compare), [subject, selector, compare]);
