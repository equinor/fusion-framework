import { useMemo } from 'react';
import { Observable } from '../types';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

import type { NestedKeys, NestedPropType } from '../types';
import { mapProp } from '../operators';

const selectorFn = <
    TType extends Record<string, unknown>,
    TSelector extends NestedKeys<TType> | ((state: TType) => TValue),
    TValue extends TSelector extends NestedKeys<TType> ? NestedPropType<TType, TSelector> : unknown,
>(
    subject: Observable<TType>,
    selector: TSelector | ((state: TType) => TValue),
    compare?: (x: TValue, y: TValue) => boolean,
): Observable<TValue> => {
    const selectorFn = typeof selector === 'function' ? map(selector) : mapProp(selector);
    return subject.pipe(
        selectorFn as unknown as OperatorFunction<TType, TValue>,
        distinctUntilChanged(compare),
    );
};

/**
 * Pluck observable value by string path
 * @param subject observable record
 * @param selector string path of property
 * @param compare [optional] compare values for changes
 */
export function useObservableSelector<
    TState extends Record<string, unknown>,
    TPath extends NestedKeys<TState>,
    TValue extends NestedPropType<TState, TPath>,
>(
    subject: Observable<TState>,
    selector: TPath,
    compare?: (x: TValue, y: TValue) => boolean,
): Observable<TValue>;

/**
 * Pluck observable value by callback function
 * @param subject observable
 * @param selector callback function
 * @param compare [optional] compare values for changes
 */
export function useObservableSelector<TType, TValue = unknown>(
    subject: Observable<TType>,
    selector: (state: TType) => TValue,
    compare?: (x: TValue, y: TValue) => boolean,
): Observable<TValue>;

/**
 * Hook for observing a property of an object
 */
export function useObservableSelector<
    TType extends Record<string, unknown>,
    TSelector extends NestedKeys<TType> | ((state: TType) => TValue),
    TValue extends TSelector extends NestedKeys<TType> ? NestedPropType<TType, TSelector> : unknown,
>(
    subject: Observable<TType>,
    selector: TSelector,
    compare?: (x: TValue, y: TValue) => boolean,
): Observable<TValue> {
    return useMemo(() => selectorFn(subject, selector, compare), [subject, selector, compare]);
}
