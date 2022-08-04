import { ModulesInstanceType } from '@equinor/fusion-framework-module';
import { HttpModule, IHttpClient } from '@equinor/fusion-framework-module-http';

import type { IServiceDiscoveryClient, IServiceDiscoveryClientCtor } from './client';

export interface IServiceDiscoveryConfigurator {
    /** name of HttpClient */
    clientKey?: string;

    endpoint?: string;

    clientCtor: IServiceDiscoveryClientCtor;

    createHttpClientClient: (
        http: ModulesInstanceType<[HttpModule]>['http']
    ) => Promise<IHttpClient>;

    createClient: (http: IHttpClient) => Promise<IServiceDiscoveryClient>;
}

export class ServiceDiscoveryConfigurator implements IServiceDiscoveryConfigurator {
    public clientKey?: string;
    public endpoint?: string;
    clientCtor: IServiceDiscoveryClientCtor;

    constructor(args: {
        clientCtor: IServiceDiscoveryClientCtor;
        clientKey?: string;
        endpoint?: string;
    }) {
        this.clientKey = args.clientKey;
        this.endpoint = args.endpoint;
        this.clientCtor = args.clientCtor;
    }

    async createHttpClientClient(
        http: ModulesInstanceType<[HttpModule]>['http']
    ): Promise<IHttpClient> {
        if (!this.clientKey) {
            throw Error('no http client for service discovery is provided!');
        }
        return http.createClient(this.clientKey);
    }

    async createClient(http: IHttpClient): Promise<IServiceDiscoveryClient> {
        if (!this.endpoint) {
            throw Error('no endpoint defined!');
        }
        return new this.clientCtor({
            http,
            endpoint: this.endpoint,
        });
    }
}
