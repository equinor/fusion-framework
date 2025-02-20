import { useEffect, useMemo, useState } from 'react';

import {
  useHttpClient,
  type HttpJsonResponseError,
  type IHttpClient,
} from '@equinor/fusion-framework-react-app/http';

/**
 * Represents the response from a person search API.
 *
 * @property {string} [azureUniqueId] - The unique identifier for the person in Azure Active Directory.
 * @property {string} [mail] - The email address of the person.
 * @property {string} [name] - The name of the person.
 * @property {string} [jobTitle] - The job title of the person.
 * @property {string} [department] - The department of the person.
 * @property {string} [fullDepartment] - The full department name of the person.
 * @property {string} [mobilePhone] - The mobile phone number of the person.
 * @property {string} [officeLocation] - The office location of the person.
 * @property {string} [upn] - The user principal name of the person.
 * @property {string} [accountType] - The account type of the person.
 * @property {boolean} isResourceOwner - Indicates whether the person is a resource owner.
 */
export type ApiPersonSearchResultV2 = {
  azureUniqueId?: string;
  mail?: string;
  name?: string;
  jobTitle?: string;
  department?: string;
  fullDepartment?: string;
  mobilePhone?: string;
  officeLocation?: string;
  upn?: string;
  accountType?: string;
  isResourceOwner: boolean;
};

/**
 * Represents the details of a validation problem, including the type, title, status, detail, instance, and any associated errors.
 *
 * This is the response from a person search API when status code is 400.
 */
export type ValidationProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: {
    [key: string]: string[];
  };
};

/**
 * Represents the details of a problem that occurred, such as an error or exception.
 * This type is commonly used in API responses to provide more information about what went wrong.
 *
 * this is the response from a person search API when status code is 424.
 *
 * @property {string} [type] - The type or category of the problem.
 * @property {string} [title] - A short, human-readable summary of the problem.
 * @property {number} [status] - The HTTP status code associated with the problem.
 * @property {string} [detail] - A detailed description of the problem.
 * @property {string} [instance] - A URI reference that identifies the specific occurrence of the problem.
 * @property {any} [key: string] - Additional, arbitrary key-value pairs that provide more details about the problem.
 */
export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

/**
 * Represents the possible error types that can be returned from the API.
 *
 * `ValidationProblemDetails`: Represents a validation error with details about the specific problem.
 * `ProblemDetails`: Represents a general problem or error that occurred.
 * `unknown`: Represents an unknown or unspecified error type.
 */
export type ErrorTypes = ValidationProblemDetails | ProblemDetails | unknown;

/**
 * Performs a search for persons using the provided HTTP client.
 *
 * @param client - The HTTP client to use for the search request.
 * @returns A function that can be called to execute the search.
 */
export const searchPerson =
  (client: IHttpClient) =>
  /**
   * Searches for persons based on the provided search string.
   *
   * @param search - The search string to use for the person search.
   * @param signal - An optional AbortSignal to cancel the search operation.
   * @throws {HttpJsonResponseError<ErrorTypes>} if `httpClient.json` is used
   * @returns A Promise that resolves to the search result.
   */
  async (search: string, signal?: AbortSignal) => {
    return client.json<ApiPersonSearchResultV2[]>(`/persons?$search=${search}`, {
      signal,
      headers: {
        'api-version': '2',
      },
    });
  };

/**
 * Represents the result of a person search operation.
 *
 * @property persons - The array of search result persons.
 * @property error - Any error that occurred during the search operation.
 * @property isSearching - Indicates whether the search operation is currently in progress.
 */
type useSearchPersonsResult = {
  persons: ApiPersonSearchResultV2[];
  error:
    | HttpJsonResponseError<ValidationProblemDetails>
    | HttpJsonResponseError<ProblemDetails>
    | HttpJsonResponseError<unknown>
    | null;
  isSearching: boolean;
};

/**
 * A React hook that provides a search functionality for persons.
 *
 * @param search - The search term to use for the person search.
 * @returns An object containing the search results, any errors that occurred, and a boolean indicating if a search is currently in progress.
 */
export const useSearchPersons = (search: string): useSearchPersonsResult => {
  // Get the HTTP client for the 'people' domain
  const httpClient = useHttpClient('people');

  // State to hold the search results
  const [persons, setPersons] = useState<ApiPersonSearchResultV2[]>([]);

  // State to hold any errors that occur during the search
  const [error, setError] = useState<HttpJsonResponseError | null>(null);

  // State to track whether a search is currently in progress
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Create a memoized search client function
  const searchClient = useMemo(() => searchPerson(httpClient), [httpClient]);

  // Perform the search when the 'search' parameter changes
  useEffect(() => {
    // Reset any previous errors
    setError(null);

    // Only perform a search if the 'search' parameter is not empty
    if (search) {
      // Create an AbortController to cancel the search if needed
      const abortController = new AbortController();

      // Set the 'isSearching' state to true
      setIsSearching(true);

      // Call the searchClient function with the search term and the AbortSignal
      searchClient(search, abortController.signal)
        .then(setPersons) // Update the 'persons' state with the search results
        .catch(setError) // Update the 'error' state with any errors
        .finally(() => {
          // Set the 'isSearching' state to false when the search is complete
          setIsSearching(false);
        });

      // Return a cleanup function to cancel the search if the component is unmounted
      return () => abortController.abort();
    } else {
      // If the'search' parameter is empty, clear the 'persons' state
      setPersons([]);
    }
  }, [search, searchClient]);

  // Return the search results, any errors, and the 'isSearching' state
  return { persons, error, isSearching };
};
