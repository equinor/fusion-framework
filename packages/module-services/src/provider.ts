import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { ClientMethod } from './types';

import { ApiClientFactory } from './types';
import { ContextApiClient } from './context';

export enum Service {
    Context = 'context',
}

type ApiServices<TMethod extends keyof ClientMethod, TClient extends IHttpClient> = {
    [Service.Context]: ContextApiClient<TMethod, TClient>;
};

export interface IApiProvider<TClient extends IHttpClient = IHttpClient> {
    /**
     * @param name - Name of the service to use
     * @param version - Version of the service to use
     */
    createApiClient<TService extends Service, TMethod extends keyof ClientMethod>(
        name: TService,
        version: TMethod
    ): Promise<ApiServices<TMethod, TClient>[TService]>;
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

    public async createApiClient<TService extends Service, TMethod extends keyof ClientMethod>(
        name: TService,
        method: TMethod
    ): Promise<ApiServices<TMethod, TClient>[TService]> {
        const httpClient = await this._createClientFn(name);
        switch (name) {
            case Service.Context:
                return new ContextApiClient(httpClient, method);
        }
        throw Error(`could not create api client for [${name}]`);
    }
}
