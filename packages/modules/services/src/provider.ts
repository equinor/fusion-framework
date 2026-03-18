import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type { ClientMethod } from './types';
import type { IApiConfigurator } from './configurator';

import type { ApiClientFactory } from './types';
import { version } from './version.js';
import { ContextApiClient } from './context';
import BookmarksApiClient from './bookmarks/client';
import { NotificationApiClient } from './notification';
import { PeopleApiClient } from './people/client';

/**
 * Public interface for the services module provider.
 *
 * Exposes factory methods for creating domain-specific API clients
 * for bookmarks, context, notification, and people services.
 * Each factory resolves a named HTTP client, attaches response
 * validation, and returns a typed client instance.
 *
 * @template TClient - The underlying HTTP client type.
 */
export interface IApiProvider<TClient extends IHttpClient = IHttpClient> {
  /**
   * Creates a typed client for the bookmarks API.
   *
   * @template TMethod - The client execution method (`'json'` or `'json$'`).
   * @param method - The execution method to use for requests.
   * @returns A configured {@link BookmarksApiClient} instance.
   */
  createBookmarksClient<TMethod extends keyof ClientMethod>(
    method: TMethod,
  ): Promise<BookmarksApiClient<TMethod, TClient>>;

  /**
   * Creates a typed client for the context API.
   *
   * @template TMethod - The client execution method (`'json'` or `'json$'`).
   * @param method - The execution method to use for requests.
   * @returns A configured {@link ContextApiClient} instance.
   */
  createContextClient<TMethod extends keyof ClientMethod>(
    method: TMethod,
  ): Promise<ContextApiClient<TMethod, TClient>>;
  /**
   * Creates a typed client for the notification API.
   *
   * @template TMethod - The client execution method (`'json'` or `'json$'`).
   * @param method - The execution method to use for requests.
   * @returns A configured {@link NotificationApiClient} instance.
   */
  createNotificationClient<TMethod extends keyof ClientMethod>(
    method: TMethod,
  ): Promise<NotificationApiClient<TMethod, TClient>>;
  /**
   * Creates a typed client for the people API.
   *
   * @returns A configured {@link PeopleApiClient} instance.
   */
  createPeopleClient(): Promise<PeopleApiClient<TClient>>;
}

/**
 * Constructor arguments for {@link ApiProvider}.
 *
 * @template TClient - The underlying HTTP client type.
 */
type ApiProviderCtorArgs<TClient extends IHttpClient = IHttpClient> = {
  /** Factory function for creating named HTTP clients used by API sub-clients. */
  createClient: ApiClientFactory<TClient>;
};

/**
 * Shape of the structured error response attached to an {@link ApiProviderError}.
 */
type ApiProviderErrorResponse = {
  type: ResponseType;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;
  data: unknown;
};

/**
 * Error thrown when an API response indicates a non-OK HTTP status.
 *
 * Contains the full {@link ApiProviderErrorResponse} (status, headers, body)
 * so callers can inspect the failure details.
 *
 * @example
 * ```ts
 * try {
 *   await provider.createNotificationClient('json');
 * } catch (err) {
 *   if (err instanceof ApiProviderError) {
 *     console.error(err.response.status, err.response.data);
 *   }
 * }
 * ```
 */
export class ApiProviderError extends Error {
  /** Structured HTTP response data associated with this error. */
  readonly response: ApiProviderErrorResponse;

  /**
   * @param msg - Human-readable error message.
   * @param response - The parsed HTTP response details.
   * @param options - Standard `ErrorOptions` (e.g. `cause`).
   */
  constructor(msg: string, response: ApiProviderErrorResponse, options?: ErrorOptions) {
    super(msg, options);
    this.response = response;
    this.name = 'ApiProviderError';
  }
}

/**
 * Validates that an HTTP response has an OK status.
 * Throws an {@link ApiProviderError} with parsed body data when the response is not OK.
 */
const validateResponse = async (response: Response) => {
  if (!response.ok) {
    const { headers, status, statusText, type, url, bodyUsed } = response;
    const isJson = headers.get('content-type')?.match(/application\/(\w*)?[+]?json/);
    const data = !bodyUsed && (await (isJson ? response.json() : response.text()));
    throw new ApiProviderError('failed to execute request, response was not ok', {
      headers,
      status,
      statusText,
      type,
      url,
      data,
    });
  }
};

/**
 * Internal configuration shape for {@link ApiProvider}.
 *
 * @template TClient - The underlying HTTP client type.
 */
type ApiProviderConfig<TClient extends IHttpClient = IHttpClient> = {
  createClient: ApiClientFactory<TClient>;
};

/**
 * Default implementation of {@link IApiProvider}.
 *
 * Manages the lifecycle of domain-specific API clients (bookmarks, context,
 * notification, people) by resolving named HTTP clients through the
 * configured {@link ApiClientFactory} and attaching response-validation
 * middleware.
 *
 * @template TClient - The underlying HTTP client type.
 */
export class ApiProvider<TClient extends IHttpClient = IHttpClient>
  extends BaseModuleProvider<ApiProviderConfig<TClient>>
  implements IApiProvider<TClient>
{
  protected _createClientFn: ApiClientFactory<TClient>;
  constructor(config: ApiProviderConfig<TClient>) {
    super({ version, config });
    this._createClientFn = config.createClient;
  }

  public async createNotificationClient<TMethod extends keyof ClientMethod>(
    method: TMethod,
  ): Promise<NotificationApiClient<TMethod, TClient>> {
    const httpClient = await this._createClientFn('notification');
    httpClient.responseHandler.add('validate_api_request', validateResponse);
    return new NotificationApiClient(httpClient, method);
  }

  public async createBookmarksClient<TMethod extends keyof ClientMethod>(
    method: TMethod,
  ): Promise<BookmarksApiClient<TMethod, TClient>> {
    const httpClient = await this._createClientFn('bookmarks');
    // TODO: update when new ResponseOperator is available
    // will fail because 'HEAD' will return 404 when no bookmarks are found
    // httpClient.responseHandler.add('validate_api_request', validateResponse);
    return new BookmarksApiClient(httpClient, method);
  }

  public async createContextClient<TMethod extends keyof ClientMethod>(
    method: TMethod,
  ): Promise<ContextApiClient<TMethod, TClient>> {
    const httpClient = await this._createClientFn('context');
    httpClient.responseHandler.add('validate_api_request', validateResponse);
    return new ContextApiClient(httpClient, method);
  }
  public async createPeopleClient(): Promise<PeopleApiClient<TClient>> {
    const httpClient = await this._createClientFn('people');
    httpClient.responseHandler.add('validate_api_request', validateResponse);
    return new PeopleApiClient(httpClient);
  }
}
