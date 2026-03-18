import type { Observable } from 'rxjs';

export * from './actions';
export * from './flow';
export * from './observable';
export * from './reducers';

export type { NestedKeys, NestedPropType } from './ts-helpers';

/** @deprecated Use {@link Flow} instead. */
export { Flow as Epic } from './flow';

/**
 * Extracts the value type `U` from `Observable<U>`.
 *
 * @template T - The observable type to unwrap.
 */
export type ObservableType<T> = T extends Observable<infer U> ? U : never;

/**
 * An observable that also exposes a synchronous `value` property holding
 * the latest emitted value (e.g., `BehaviorSubject` or {@link FlowSubject}).
 *
 * @template TType - The value type.
 */
export type StatefulObservable<TType> = Observable<TType> & { value: TType };
