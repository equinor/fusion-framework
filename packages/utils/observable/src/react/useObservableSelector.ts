import { useMemo } from 'react';
import type { Observable } from '../types';
import { distinctUntilChanged, map } from 'rxjs/operators';
import type { OperatorFunction } from 'rxjs';

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
 * React hook that derives a child observable from a parent observable by
 * selecting a nested property (via a dot-path string) and emitting only when
 * the selected value changes.
 *
 * @template TState - The source state object type.
 * @template TPath - A dot-separated key path into `TState`.
 * @template TValue - The resolved property type.
 * @param subject - The source observable.
 * @param selector - A dot-path string describing the property to select.
 * @param compare - Optional equality comparator.
 * @returns An `Observable<TValue>` that emits when the selected value changes.
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
 * React hook that derives a child observable from a parent observable using
 * a callback selector function, emitting only when the selected value changes.
 *
 * @template TType - The source value type.
 * @template TValue - The selected value type.
 * @param subject - The source observable.
 * @param selector - A function that projects each emitted value.
 * @param compare - Optional equality comparator.
 * @returns An `Observable<TValue>` that emits when the selected value changes.
 */
export function useObservableSelector<TType, TValue = unknown>(
  subject: Observable<TType>,
  selector: (state: TType) => TValue,
  compare?: (x: TValue, y: TValue) => boolean,
): Observable<TValue>;

/** Implementation of `useObservableSelector`. */
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
