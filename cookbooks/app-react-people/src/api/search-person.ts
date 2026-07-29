import type { IHttpClient } from '@equinor/fusion-framework-react-app/http';

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
  // biome-ignore lint/suspicious/noExplicitAny: index signature must accept arbitrary problem-detail extension values
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
