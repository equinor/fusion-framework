import { ModuleInitializerArgs } from '@equinor/fusion-framework-module';
import { HttpModule, IHttpClient } from '@equinor/fusion-framework-module-http';
import { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import { QueryCtorOptions } from '@equinor/fusion-query';

import { WidgetConfigBuilder, WidgetConfigBuilderCallback } from './WidgetConfigBuilder';

import { moduleKey } from './module';

import type { GetWidgetConfig, Widget, WidgetManifest } from './types';
import { map } from 'rxjs';

export interface WidgetModuleConfig {
    client: {
        getWidgetManifest: QueryCtorOptions<WidgetManifest, { widgetKey: string }>;
        getWidget: QueryCtorOptions<Widget, GetWidgetConfig>;
    };
}

export interface IWidgetConfigurator {
    addConfigBuilder: (init: WidgetConfigBuilderCallback) => void;
}

export class WidgetConfigurator implements IWidgetConfigurator {
    defaultExpireTime = 1 * 60 * 1000;

    #configBuilders: Array<WidgetConfigBuilderCallback> = [];

    addConfigBuilder(init: WidgetConfigBuilderCallback): void {
        this.#configBuilders.push(init);
    }

    /**
     * WARNING: this function will be remove in future
     */
    protected async _createHttpClient(
        init: ModuleInitializerArgs<IWidgetConfigurator, [HttpModule, ServiceDiscoveryModule]>
    ): Promise<IHttpClient> {
        const http = await init.requireInstance('http');
        /** check if the http provider has configure a client */
        if (http.hasClient(moduleKey)) {
            return http.createClient(moduleKey);
        } else {
            /** load service discovery module */
            const serviceDiscovery = await init.requireInstance('serviceDiscovery');

            const discoClient = await serviceDiscovery.createClient('apps');

            return discoClient;
        }
    }

    public async createConfig(
        init: ModuleInitializerArgs<IWidgetConfigurator, [HttpModule, ServiceDiscoveryModule]>
    ): Promise<WidgetModuleConfig> {
        const config = await this.#configBuilders.reduce(async (cur, cb) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const builder = new WidgetConfigBuilder(init, await cur);
            await Promise.resolve(cb(builder));
            return Object.assign(cur, builder.config);
        }, Promise.resolve({} as Partial<WidgetModuleConfig>));

        // TODO - make less lazy
        config.client ??= await (async (): Promise<WidgetModuleConfig['client']> => {
            const httpClient = await this._createHttpClient(init);
            return {
                getWidgetManifest: {
                    client: {
                        fn: ({ widgetKey }) =>
                            httpClient.json$<WidgetManifest>(
                                `/widgets/${widgetKey}?api-version=1.0-preview`
                            ),
                    },
                    key: ({ widgetKey }) => widgetKey,
                    expire: this.defaultExpireTime,
                },
                getWidget: {
                    client: {
                        fn: ({ widgetKey, args }) => {
                            const transform = (s: Widget) =>
                                appendBundleImport(s, httpClient.uri, '1.0-preview');

                            if (!args) {
                                return httpClient
                                    .json$(`/widgets/${widgetKey}?api-version=1.0-preview}`)
                                    .pipe(map((s) => transform(s as unknown as Widget)));
                            }
                            //future-proofing
                            const version = args.type === 'tag' ? args.tag : args.version;
                            return httpClient
                                .json$(
                                    `/widgets/${widgetKey}/versions/${version}?api-version=1.0-preview`
                                )
                                .pipe(map((s) => transform(s as unknown as Widget)));
                        },
                    },
                    key: (args) => JSON.stringify(args),
                    expire: this.defaultExpireTime,
                },
            };
        })();

        return config as WidgetModuleConfig;
    }
}

function appendBundleImport(widgetConfig: Widget, uri: string, apiVersion = '1.0') {
    return {
        ...widgetConfig,
        importBundle: async () =>
            import(
                new URL(
                    `${widgetConfig.assetPath}/${widgetConfig.entryPoint}?api-version=${apiVersion}`,
                    uri
                ).toString()
            ),
    };
}
