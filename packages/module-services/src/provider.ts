import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { ClientMethod } from './lib/types';

import { ApiClientFactory } from './types';
import { ContextApiClient } from './lib/context';

enum Services {
    Context = 'context',
}

type ApiServices<TClient extends IHttpClient, TMethod extends keyof ClientMethod> = {
    [Services.Context]: ContextApiClient<TClient, TMethod>;
};

export interface IApiProvider {
    createApiClient<TService extends Services, TMethod extends keyof ClientMethod>(
        name: TService,
        version: TMethod
    ): Promise<ApiServices<IHttpClient, TMethod>[TService]>;
}

type ApiProviderCtorArgs = {
    createClient: ApiClientFactory;
};

export class ApiProvider implements IApiProvider {
    protected __createClientFn: ApiClientFactory;
    constructor({ createClient }: ApiProviderCtorArgs) {
        this.__createClientFn = createClient;
    }

    public async createApiClient<TService extends Services, TMethod extends keyof ClientMethod>(
        name: TService,
        method: TMethod
    ): Promise<ApiServices<IHttpClient, TMethod>[TService]> {
        const httpClient = await this.__createClientFn(name);
        switch (name) {
            case Services.Context:
                return new ContextApiClient(httpClient, method);
        }
        throw Error(`could not create api client for [${name}]`);
    }
}
