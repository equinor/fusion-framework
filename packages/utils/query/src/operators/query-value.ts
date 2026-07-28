import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { Query } from '../Query';

/**
 * Transforms a query result Observable into a plain value Observable by extracting the `value` property.
 *
 * Use this operator to strip query metadata (status, transaction, timestamps) from
 * the result stream when only the raw data is needed.
 *
 * @template TType - The type of the data value extracted from the query result.
 * @template TArgs - The type of the query arguments.
 *
 * @param source$ - An Observable stream of query task results (cached or completed).
 * @returns An Observable stream of `TType` where each emission is the extracted value.
 *
 * @example
 * ```typescript
 * import { Query, operators } from '@equinor/fusion-query';
 *
 * const query = new Query({ client: { fn: fetchUser }, key: (args) => args.id });
 * query.query({ id: '123' }).pipe(operators.queryValue).subscribe(user => {
 *   console.log(user.name);
 * });
 * ```
 */
export const queryValue = <TType, TArgs>(
  source$: ReturnType<Query<TType, TArgs>['query']>,
): Observable<TType> =>
  source$
    // strip query metadata, keeping only the raw data value
    .pipe(map((entry) => entry.value));
