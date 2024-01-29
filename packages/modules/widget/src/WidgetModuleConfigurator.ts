/* eslint-disable @typescript-eslint/ban-ts-comment */

import { BaseConfigBuilder, type ConfigBuilderCallback } from '@equinor/fusion-framework-module';

import type { Client, WidgetEndpointBuilder } from './types';
import { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import { defaultEndpointBuilder, removeTrailingSlashFromURI } from './utils';

export type WidgetModuleConfig = {
    client: Client;
    apiVersion: string;
    baseImportUrl: string;
    endpointBuilder: WidgetEndpointBuilder;
};

export type WidgetModuleConfigBuilderCallback = (
    builder: WidgetModuleConfigurator,
) => void | Promise<void>;

export class WidgetModuleConfigurator extends BaseConfigBuilder<WidgetModuleConfig> {
    defaultExpireTime = 1 * 60 * 1000;

    public setApiVersion(apiVision: string) {
        // @ts-expect-error
        this._set('apiVersion', () => apiVision);
    }
    public setBaseImportUrl(url: string) {
        this._set('baseImportUrl', () => url);
    }

    public setClient(cb: ConfigBuilderCallback<Client>) {
        this._set('client', cb);
    }

    private async _createHttpClient(init: ConfigBuilderCallbackArgs) {
        const http = await init.requireInstance('http');

        if (http.hasClient('apps')) {
            return http.createClient('apps');
        } else {
            /** load service discovery module */
            const serviceDiscovery = await init.requireInstance('serviceDiscovery');

            const discoClient = await serviceDiscovery.createClient('apps');

            return discoClient;
        }
    }

    protected async _processConfig(
        config: Partial<WidgetModuleConfig>,
        _init: ConfigBuilderCallbackArgs,
    ) {
        const httpClient = await this._createHttpClient(_init);

        if (!config.apiVersion) {
            config.apiVersion = '1.0-preview';
        }

        if (!config.endpointBuilder) {
            config.endpointBuilder = defaultEndpointBuilder(config.apiVersion);
        }

        if (!config.baseImportUrl) {
            config.baseImportUrl = removeTrailingSlashFromURI(httpClient.uri);
        }

        if (!config.client) {
            config.client = {
                getWidget: {
                    client: {
                        fn: (args) =>
                            httpClient.json$((config as WidgetModuleConfig).endpointBuilder(args)),
                    },
                    key: (args) => JSON.stringify(args.widgetKey),
                },
            };
        }
        return config as WidgetModuleConfig;
    }
}
