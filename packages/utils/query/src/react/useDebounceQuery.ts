import { useState } from 'react';
import { useDebounce, type UseDebounceOptions } from '@equinor/fusion-observable/react';
import Query, { type QueryCtorOptions } from '../Query';

/**
 * React hook that creates a debounced query, delaying execution until input stabilizes.
 *
 * Accepts either an existing {@link Query} instance or {@link QueryCtorOptions} to create one.
 * The hook internally binds the query method and applies debounce timing via
 * {@link UseDebounceOptions}, preventing excessive network requests during rapid input changes
 * such as search-as-you-type scenarios.
 *
 * @template TType - The type of data returned by the query.
 * @template TArgs - The type of arguments passed to the query function.
 *
 * @param clientOrClientCtor - An existing `Query` instance or constructor options to create one.
 * @param options - Debounce configuration including delay duration and optional leading/trailing flags.
 * @returns The debounced result from {@link useDebounce}, including the latest value and loading state.
 *
 * @example
 * ```tsx
 * import { useDebounceQuery } from '@equinor/fusion-query/react';
 *
 * function SearchComponent() {
 *   const [search, setSearch] = useState('');
 *   const result = useDebounceQuery(myQuery, {
 *     args: [{ search }],
 *     delay: 300,
 *   });
 *   return <div>{result.value?.name}</div>;
 * }
 * ```
 */
export const useDebounceQuery = <TType, TArgs>(
  clientOrClientCtor: Query<TType, TArgs> | QueryCtorOptions<TType, TArgs>,
  options: UseDebounceOptions<[TArgs]>,
) => {
  const [query] = useState<Query<TType, TArgs>['query']>(() => {
    const client =
      clientOrClientCtor instanceof Query ? clientOrClientCtor : new Query(clientOrClientCtor);
    return client.query.bind(client);
  });

  return useDebounce(query, options);
};

export default useDebounceQuery;
