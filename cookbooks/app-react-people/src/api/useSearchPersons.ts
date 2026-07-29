import { useEffect, useMemo, useState } from 'react';

import {
  useHttpClient,
  type HttpJsonResponseError,
} from '@equinor/fusion-framework-react-app/http';

import {
  type ApiPersonSearchResultV2,
  type ProblemDetails,
  type ValidationProblemDetails,
  searchPerson,
} from './search-person';

/** Represents the current result and status of a person search. */
export interface UseSearchPersonsResult {
  persons: ApiPersonSearchResultV2[];
  error:
    | HttpJsonResponseError<ValidationProblemDetails>
    | HttpJsonResponseError<ProblemDetails>
    | HttpJsonResponseError<unknown>
    | null;
  isSearching: boolean;
}

/**
 * Searches for people as the query changes and exposes loading and error state.
 *
 * @param search - The search term to send to the people API.
 * @returns The latest people, error, and loading state.
 */
export const useSearchPersons = (search: string): UseSearchPersonsResult => {
  const httpClient = useHttpClient('people');
  const [persons, setPersons] = useState<ApiPersonSearchResultV2[]>([]);
  const [error, setError] = useState<HttpJsonResponseError | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchClient = useMemo(() => searchPerson(httpClient), [httpClient]);

  useEffect(() => {
    setError(null);

    // Skip the request and clear stale results when the query is empty.
    if (search) {
      const abortController = new AbortController();
      setIsSearching(true);

      searchClient(search, abortController.signal)
        .then(setPersons)
        .catch(setError)
        .finally(() => setIsSearching(false));

      return () => abortController.abort();
    }

    setPersons([]);
  }, [search, searchClient]);

  return { persons, error, isSearching };
};
