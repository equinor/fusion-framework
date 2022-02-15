import { IServiceDiscoveryConfigurator } from './configurator';

import type { Environment, Service } from './types';

import type { ModulesConfigType } from '@equinor/fusion-framework-module';
import type {
    HttpModule,
    IHttpClient,
    IHttpClientProvider,
} from '@equinor/fusion-framework-module-http';

export interface IServiceDiscoveryProvider {
    /**
     * Try to resolve services for requested key
     */
    resolveService(key: string): Promise<Service | undefined>;
    /**
     * service environment
     */
    readonly environment: Promise<Environment>;

    configureClient(name: string, config: ModulesConfigType<[HttpModule]>): Promise<void>;
}

export class ServiceDiscoveryProvider implements IServiceDiscoveryProvider {
    constructor(
        protected readonly _config: IServiceDiscoveryConfigurator,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        protected readonly _http: IHttpClientProvider
    ) {}

    get environment(): Promise<Environment> {
        return { ...this._getEnvironment() };
    }

    async resolveService(key: string): Promise<Service | undefined> {
        const { services } = await this._getEnvironment();
        // TODO - not found error
        const service = services[key];
        return service;
    }

    async configureClient(
        name: string,
        config: ModulesConfigType<[HttpModule]>,
        onCreate?: (client: IHttpClient) => void
    ): Promise<void> {
        const service = await this.resolveService(name);
        if (!service) {
            throw Error(`Could not load configuration of service [${name}]`);
        }
        config.http.configureClient(name, {
            baseUri: service.uri,
            defaultScopes: service.defaultScopes,
            onCreate,
        });
    }

    protected _environment?: Environment;
    protected async _getEnvironment(): Promise<Environment> {
        if (!this._environment) {
            this._environment = await this._fetchServiceDescription();
        }
        return this._environment;
    }

    protected async _fetchServiceDescription(): Promise<Environment> {
        try {
            const { clientKey, uri, selector } = this._config;
            const client = this._http.createClient(clientKey);
            const result = await client.fetchAsync(uri, { selector });
            return result;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
