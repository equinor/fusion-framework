import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { ClientMethod } from './types';

import { ApiClientFactory } from './types';
import { ContextApiClient } from './context';
import BookmarksApiClient from './bookmarks/client';

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
}

type ApiProviderCtorArgs<TClient extends IHttpClient = IHttpClient> = {
    /** method for creating IHttpClients for api clients */
    createClient: ApiClientFactory<TClient>;
};

export class ApiProvider<TClient extends IHttpClient = IHttpClient>
    implements IApiProvider<TClient>
{
    protected _createClientFn: ApiClientFactory<TClient>;
    constructor({ createClient }: ApiProviderCtorArgs<TClient>) {
        this._createClientFn = createClient;
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
        return new ContextApiClient(httpClient, method);
    }
}
