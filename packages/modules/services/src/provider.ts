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

export class ApiProviderHttpError extends Error {
    readonly type: ResponseType;
    readonly status: number;
    readonly statusText: string;
    readonly json?: Promise<unknown>;

    constructor(msg: string, response: Response, options?: ErrorOptions) {
        super(msg, options);
        this.type = response.type;
        this.status = response.status;
        this.statusText = response.statusText;
        try {
            this.json = response.json();
        } catch (err) {
            this.json = Promise.resolve({ err });
        }
    }
}

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
        return new NotificationApiClient(httpClient, method);
    }

    public async createBookmarksClient<TMethod extends keyof ClientMethod, TPayload = unknown>(
        method: TMethod
    ): Promise<BookmarksApiClient<TMethod, TClient, TPayload>> {
        const httpClient = await this._createClientFn('bookmarks');
        return new BookmarksApiClient(httpClient, method);
    }

    public async createContextClient<TMethod extends keyof ClientMethod>(
        method: TMethod
    ): Promise<ContextApiClient<TMethod, TClient>> {
        const httpClient = await this._createClientFn('context');
        httpClient.responseHandler.add('validate_api_request', (response) => {
            if (!response.ok) {
                throw new ApiProviderHttpError('ContextApiClient: response was not ok', response);
            }
        });
        return new ContextApiClient(httpClient, method);
    }
}
