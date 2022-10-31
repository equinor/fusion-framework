import { map, Observable } from 'rxjs';
import Query from './Query';

export { default, Query, QueryCtorOptions, QueryOptions } from './Query';

export const queryValue = <TType, TArgs>(
    stream: ReturnType<Query<TType, TArgs>['query']>
): Observable<TType> => stream.pipe(map((entry) => entry.value));
