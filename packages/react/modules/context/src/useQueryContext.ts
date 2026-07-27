import type { IContextProvider } from '@equinor/fusion-framework-module-context';
import { useObservableState, useDebounce } from '@equinor/fusion-observable/react';
import { useMemo } from 'react';

/**
 * Hook for querying context items via the given context provider, debouncing calls.
 *
 * @param provider - The context provider used to perform the query
 * @param options - Optional query options, such as a debounce delay in milliseconds
 * @returns The current query result, whether a query is in progress, and a function to trigger a new query
 */
export const useQueryContext = (provider: IContextProvider, options?: { debounce?: number }) => {
  const args = Object.assign({}, { debounce: 500 }, options);
  const searchFn = useMemo(() => provider.queryContext.bind(provider), [provider]);
  const { idle, next, value$ } = useDebounce(searchFn, args);
  const { value } = useObservableState(value$);
  return { value, querying: !idle, query: next };
};
