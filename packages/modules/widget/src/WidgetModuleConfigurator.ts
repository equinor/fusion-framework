import { BaseConfigBuilder, type ConfigBuilderCallback } from '@equinor/fusion-framework-module';
import { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import { createDefaultClient } from './utils';
import type { IClient } from './types';

// Define the configuration type for the WidgetModule
export type WidgetModuleConfig = {
    client: IClient;
};

// Define a callback type for configuring the WidgetModule
export type WidgetModuleConfigBuilderCallback = (
    builder: WidgetModuleConfigurator,
) => void | Promise<void>;

// Class responsible for configuring the WidgetModule
export class WidgetModuleConfigurator extends BaseConfigBuilder<WidgetModuleConfig> {
    // Default expiration time for configurations (1 minute)
    defaultExpireTime = 1 * 60 * 1000;

    /**
     * Set the client for the WidgetModule configuration.
     * @param cb - Callback function to configure the client.
     */
    public setClient(cb: ConfigBuilderCallback<IClient>) {
        this._set('client', cb);
    }

    /**
     * Create an HTTP client based on the provided parameters.
     * @param clientId - Identifier for the client.
     * @param init - Configuration builder callback arguments.
     * @returns An instance of the HTTP client.
     */
    private async _createHttpClient(clientId: string, init: ConfigBuilderCallbackArgs) {
        const http = await init.requireInstance('http');

        if (http.hasClient(clientId)) {
            return http.createClient(clientId);
        } else {
            /** load service discovery module */
            const serviceDiscovery = await init.requireInstance('serviceDiscovery');
            return await serviceDiscovery.createClient(clientId);
        }
    }

    /**
     * Process the WidgetModule configuration and create an HTTP client if needed.
     * @param config - Partial configuration for the WidgetModule.
     * @param _init - Configuration builder callback arguments.
     * @returns The processed WidgetModule configuration.
     */
    protected async _processConfig(
        config: Partial<WidgetModuleConfig>,
        _init: ConfigBuilderCallbackArgs,
    ) {
        // Create an HTTP client using the specified client ID and initialization parameters
        const httpClient = await this._createHttpClient('apps', _init);

        // If the configuration does not have a client, use the default client
        if (!config.client) {
            config.client = createDefaultClient(httpClient);
        }
        // Return the processed configuration as a WidgetModuleConfig object
        return config as WidgetModuleConfig;
    }
}
