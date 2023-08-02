import { configureHttpClient } from '@equinor/fusion-framework-module-http';

import { IServiceDiscoveryClient } from './client';

import type { ModulesConfigurator, ModuleType } from '@equinor/fusion-framework-module';
import type {
    HttpClientOptions,
    HttpModule,
    IHttpClient,
} from '@equinor/fusion-framework-module-http';

import type { Environment, Service } from './types';

export interface IServiceDiscoveryProvider {
    /**
     * Try to resolve services for requested key
     */
    resolveService(key: string): Promise<Service>;
    /**
     * service environment
     * this might throw error if no environment is loaded
     */
    readonly environment: Environment;

    resolveServices(): Promise<Environment>;

    createClient(
        name: string,
        opt?: Omit<HttpClientOptions, 'baseUri' | 'defaultScopes' | 'ctor'>,
    ): Promise<IHttpClient>;

    configureClient(
        serviceName: string | { key: string; alias: string },
        config: ModulesConfigurator<[HttpModule]>,
    ): Promise<void>;
}

export class ServiceDiscoveryProvider implements IServiceDiscoveryProvider {
    constructor(
        protected readonly _client: IServiceDiscoveryClient,
        protected readonly _http: ModuleType<HttpModule>,
    ) {}

    public get environment(): Environment {
        return this._client.environment;
    }

    public resolveServices(): Promise<Environment> {
        return this._client.fetchEnvironment();
    }

    public async resolveService(key: string): Promise<Service> {
        return this._client.resolveService(key);
    }

    public async createClient(
        name: string,
        opt?: Omit<HttpClientOptions, 'baseUri' | 'defaultScopes' | 'ctor'>,
    ): Promise<IHttpClient> {
        const service = await this.resolveService(name);
        if (!service) {
            throw Error(`Could not load configuration of service [${name}]`);
        }
        return this._http.createClient({
            ...opt,
            baseUri: service.uri,
            defaultScopes: service.defaultScopes,
        });
    }

    public async configureClient(
        serviceName: string | { key: string; alias: string },
        config: ModulesConfigurator<[HttpModule]>,
    ): Promise<void> {
        const { key, alias } =
            typeof serviceName === 'string'
                ? { key: serviceName, alias: serviceName }
                : serviceName;
        const { uri: baseUri, defaultScopes } = await this.resolveService(key);
        config.addConfig(configureHttpClient(alias, { baseUri, defaultScopes }));
    }
}
