import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { ClientMethod } from './types';

import { ApiClientFactory } from './types';
import { ContextApiClient } from './context';
import BookmarksApiClient from './bookmarks/client';
import { NotificationApiClient } from './notification';

export interface IApiProvider<TClient extends IHttpClient = IHttpClient> {
    /**
     * @param method - Version of the service to use
     */
    createBookmarksClient<TMethod extends keyof ClientMethod, TPayload = unknown>(
        method: TMethod
    ): Promise<BookmarksApiClient<TMethod, TClient, TPayload>>;

    /**
     * @param method - Version of the service to use
     */
    createContextClient<TMethod extends keyof ClientMethod>(
        method: TMethod
    ): Promise<ContextApiClient<TMethod, TClient>>;
    /**
     * @param method - Version of the service to use
     */
    createNotificationClient<TMethod extends keyof ClientMethod>(
        method: TMethod
    ): Promise<NotificationApiClient<TMethod, TClient>>;
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

export class ApiProvider<TClient extends IHttpClient = IHttpClient>
    implements IApiProvider<TClient>
{
    protected _createClientFn: ApiClientFactory<TClient>;
    constructor({ createClient }: ApiProviderCtorArgs<TClient>) {
        this._createClientFn = createClient;
    }

    public async createNotificationClient<TMethod extends keyof ClientMethod>(
        method: TMethod
    ): Promise<NotificationApiClient<TMethod, TClient>> {
        const httpClient = await this._createClientFn('notification');
        httpClient.responseHandler.add('validate_api_request', validateResponse);
        return new NotificationApiClient(httpClient, method);
    }

    public async createBookmarksClient<TMethod extends keyof ClientMethod, TPayload = unknown>(
        method: TMethod
    ): Promise<BookmarksApiClient<TMethod, TClient, TPayload>> {
        const httpClient = await this._createClientFn('bookmarks');
        httpClient.responseHandler.add('validate_api_request', validateResponse);
        return new BookmarksApiClient(httpClient, method);
    }

    public async createContextClient<TMethod extends keyof ClientMethod>(
        method: TMethod
    ): Promise<ContextApiClient<TMethod, TClient>> {
        const httpClient = await this._createClientFn('context');
        httpClient.responseHandler.add('validate_api_request', validateResponse);
        return new ContextApiClient(httpClient, method);
    }
}
