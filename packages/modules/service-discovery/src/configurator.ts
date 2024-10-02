import { from, lastValueFrom, ObservableInput } from 'rxjs';

import {
    BaseConfigBuilder,
    type ConfigBuilderCallback,
    type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';

import { type IHttpClient } from '@equinor/fusion-framework-module-http';

import { type IServiceDiscoveryClient, ServiceDiscoveryClient } from './client';

export interface ServiceDiscoveryConfig {
    /** Service Discovery client */
    discoveryClient: IServiceDiscoveryClient;
}

export class ServiceDiscoveryConfigurator extends BaseConfigBuilder<ServiceDiscoveryConfig> {
    protected async _createConfig(
        init: ConfigBuilderCallbackArgs,
        initial?: Partial<ServiceDiscoveryConfig> | undefined,
    ): Promise<ServiceDiscoveryConfig> {
        if (!init.hasModule('http')) {
            throw new Error('http module is required');
        }

        // if discoveryClient is not configured, check if http module has a client with key 'service_discovery'
        if (!this._has('discoveryClient')) {
            // check if http module has a client with key 'service_discovery'
            const httpProvider = await init.requireInstance('http');
            if (httpProvider.hasClient('service_discovery')) {
                this.configureServiceDiscoveryClientByClientKey('service_discovery');
            }
        }

        // convert parent to promise
        return lastValueFrom(from(super._createConfig(init, initial)));
    }

    /**
     * Processes the service discovery configuration.
     *
     * @param config - A partial configuration object for service discovery.
     * @param init - Initialization arguments for the configuration builder callback.
     * @returns An observable input of the complete service discovery configuration.
     * @throws Will throw an error if `discoveryClient` is not configured.
     */
    protected _processConfig(
        config: Partial<ServiceDiscoveryConfig>,
        init: ConfigBuilderCallbackArgs,
    ): ObservableInput<ServiceDiscoveryConfig> {
        if (!config.discoveryClient) {
            throw new Error('discoveryClient is required, please configure it');
        }
        return super._processConfig(config, init);
    }

    /**
     * Sets the service discovery client.
     *
     * @param discoveryClient - An instance of `IServiceDiscoveryClient` or a callback function that returns an instance of `IServiceDiscoveryClient`.
     *
     * This method configures the service discovery client by either directly setting the provided instance or by invoking the provided callback function to obtain the instance.
     */
    setServiceDiscoveryClient(
        discoveryClient: IServiceDiscoveryClient | ConfigBuilderCallback<IServiceDiscoveryClient>,
    ): void {
        this._set(
            'discoveryClient',
            typeof discoveryClient === 'function' ? discoveryClient : async () => discoveryClient,
        );
    }

    /**
     * Configures the Service Discovery Client with the provided configuration callback.
     *
     * @param configCallback - A callback function that takes an argument of type `{ httpClient: IHttpClient; endpoint?: string }`
     * and returns a configuration object. The `httpClient` is required, while the `endpoint` is optional.
     *
     * @throws {Error} Throws an error if `httpClient` is not provided in the configuration.
     */
    configureServiceDiscoveryClient(
        configCallback: ConfigBuilderCallback<{ httpClient: IHttpClient; endpoint?: string }>,
    ): void {
        this.setServiceDiscoveryClient(async (args) => {
            const { httpClient, endpoint } =
                (await lastValueFrom(from(configCallback(args)))) ?? {};
            if (httpClient) {
                return new ServiceDiscoveryClient({
                    http: httpClient,
                    endpoint,
                });
            }
            throw Error('httpClient is required');
        });
    }

    /**
     * Configures a service discovery client using the provided client key and optional endpoint.
     *
     * @param clientKey - The key used to identify the client.
     * @param endpoint - An optional endpoint to be used by the service discovery client.
     *
     * @remarks
     * The http module must have a configured client which match provided `clientKey`.
     *
     * This method sets up the service discovery client by requiring an HTTP provider instance,
     * creating an HTTP client with the given client key, and returning an object containing
     * the HTTP client and the optional endpoint.
     */
    configureServiceDiscoveryClientByClientKey(clientKey: string, endpoint?: string): void {
        this.configureServiceDiscoveryClient(async ({ requireInstance }) => {
            const httpProvider = await requireInstance('http');
            const httpClient = httpProvider.createClient(clientKey);
            return {
                httpClient,
                endpoint,
            };
        });
    }
}
