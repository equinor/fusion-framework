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

export interface IApiProvider<TClient extends IHttpClient = IHttpClient> {
  /**
   * @param method - Version of the service to use
   */
  createBookmarksClient<TMethod extends keyof ClientMethod>(
    method: TMethod,
  ): Promise<BookmarksApiClient<TMethod, TClient>>;

  /**
   * @param method - Version of the service to use
   */
  createContextClient<TMethod extends keyof ClientMethod>(
    method: TMethod,
  ): Promise<ContextApiClient<TMethod, TClient>>;
  /**
   * @param method - Version of the service to use
   */
  createNotificationClient<TMethod extends keyof ClientMethod>(
    method: TMethod,
  ): Promise<NotificationApiClient<TMethod, TClient>>;
  /**
   * @param method - Version of the service to use
   */
  createPeopleClient(): Promise<PeopleApiClient<TClient>>;
}

type ApiProviderCtorArgs<TClient extends IHttpClient = IHttpClient> = {
  /** method for creating IHttpClients for api clients */
  createClient: ApiClientFactory<TClient>;
};

// TODO move to own file
type ApiProviderErrorResponse = {
  type: ResponseType;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;
  data: unknown;
};

// TODO move to own file
export class ApiProviderError extends Error {
  readonly response: ApiProviderErrorResponse;

  constructor(msg: string, response: ApiProviderErrorResponse, options?: ErrorOptions) {
    super(msg, options);
    this.response = response;
    this.name = 'ApiProviderError';
  }
}

// TODO move to own file
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

type ApiProviderConfig<TClient extends IHttpClient = IHttpClient> = {
  createClient: ApiClientFactory<TClient>;
};

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
