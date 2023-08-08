import { Observable } from 'rxjs';

export * from './actions';
export * from './flow';
export * from './observable';
export * from './reducers';

export type { NestedKeys, NestedPropType } from './ts-helpers';

/** @deprecated use {@link Flow}  */
export { Flow as Epic } from './flow';

export type ObservableType<T> = T extends Observable<infer U> ? U : never;

export type StatefulObservable<TType> = Observable<TType> & { value: TType };
