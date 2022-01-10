import { ServiceDiscoveryConfigurator } from './configurator';

import type { Environment, Service } from 'types';

import type { IHttpClientProvider } from '@equinor/fusion-framework-module-http';

export interface IServiceDiscoveryProvider {
    /**
     * Try to resolve services for requested key
     */
    resolveService(key: string): Promise<Service | undefined>;
    /**
     * service environment
     */
    readonly environment: Promise<Environment>;
}

export class ServiceDiscoveryProvider implements IServiceDiscoveryProvider {
    constructor(
        protected readonly _config: ServiceDiscoveryConfigurator,
        protected readonly _http: IHttpClientProvider<any>
    ) {}

    get environment(): Promise<Environment> {
        return { ...this._getEnvironment() };
    }

    async resolveService(key: string): Promise<Service | undefined> {
        const { services } = await this._getEnvironment();
        return services.find((x) => x.key === key);
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
            const client = this._http.createClient(this._config.clientKey);
            const result = await client.fetchAsync(this._config.uri);
            return await result.json();
            // TODO - catch me
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
