import { IServiceDiscoveryConfigurator } from './configurator';

import type { Environment, Service } from './types';

import type { ModulesConfigType } from '@equinor/fusion-framework-module';
import type { HttpModule, IHttpClientProvider } from '@equinor/fusion-framework-module-http';

export interface IServiceDiscoveryProvider {
    /**
     * Try to resolve services for requested key
     */
    resolveService(key: string): Promise<Service | undefined>;
    /**
     * service environment
     */
    readonly environment: Promise<Environment>;
    readonly clientId: Promise<string>;

    configureClient(name: string, config: ModulesConfigType<[HttpModule]>): Promise<void>;
}

export class ServiceDiscoveryProvider implements IServiceDiscoveryProvider {
    constructor(
        protected readonly _config: IServiceDiscoveryConfigurator,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        protected readonly _http: IHttpClientProvider<any>
    ) {}

    get environment(): Promise<Environment> {
        return { ...this._getEnvironment() };
    }

    get clientId(): Promise<string> {
        return this.environment.then((x) => x.clientId);
    }

    async resolveService(key: string): Promise<Service | undefined> {
        const { services } = await this._getEnvironment();
        return services.find((x) => x.key === key);
    }

    async configureClient(name: string, config: ModulesConfigType<[HttpModule]>): Promise<void> {
        const service = await this.resolveService(name);
        if (!service) {
            throw Error(`Could not load configuration of service [${name}]`);
        }
        config.http.configureClient(name, {
            baseUri: service.uri,
            onCreate: (client) => {
                client.defaultScope = service.defaultScopes;
            },
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
            const client = this._http.createClient(this._config.clientKey);
            const result = await client.fetchAsync(this._config.uri);
            const env: Environment = await result.json();
            // TODO - service should return this!
            env.services.forEach((x) => (x.defaultScopes = [env.clientId + '/.default']));
            // TODO - catch me
            return env;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
