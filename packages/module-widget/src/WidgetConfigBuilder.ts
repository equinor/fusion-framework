import { ModuleInitializerArgs, Modules, ModuleType } from '@equinor/fusion-framework-module';
import { QueryFn, QueryCtorOptions } from '@equinor/fusion-query';

import { WidgetModuleConfig, IWidgetConfigurator } from './WidgetConfigurator';

import type { WidgetConfig, WidgetManifest, ModuleDeps } from './types';

export type WidgetConfigBuilderCallback = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    builder: WidgetConfigBuilder<ModuleInitializerArgs<IWidgetConfigurator, any>>
) => void | Promise<void>;

export class WidgetConfigBuilder<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TInit extends ModuleInitializerArgs<IWidgetConfigurator, any> = ModuleInitializerArgs<
        IWidgetConfigurator,
        ModuleDeps
    >
> {
    #init: TInit;
    constructor(init: TInit, public config: Partial<WidgetModuleConfig> = {}) {
        this.#init = init;
    }

    requireInstance<TKey extends string = Extract<keyof Modules, string>>(
        module: TKey
    ): Promise<ModuleType<Modules[TKey]>>;

    requireInstance<T>(module: string): Promise<T>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requireInstance(module: string): Promise<any> {
        return this.#init.requireInstance(module);
    }

    setWidgetClient(
        client: {
            getWidgetManifest:
                | QueryFn<WidgetManifest, { widgetKey: string }>
                | QueryCtorOptions<WidgetManifest, { widgetKey: string }>;
            getWidgetConfig:
                | QueryFn<WidgetConfig, { widgetKey: string }>
                | QueryCtorOptions<WidgetConfig, { widgetKey: string; version: string }>;
        },
        expire = 1 * 60 * 1000
    ) {
        client;
        expire;

        this.config.client = {
            getWidgetManifest:
                typeof client.getWidgetManifest === 'function'
                    ? {
                          key: ({ widgetKey: appKey }) => appKey,
                          client: {
                              fn: client.getWidgetManifest,
                          },
                          expire,
                      }
                    : client.getWidgetManifest,
            getWidgetConfig:
                typeof client.getWidgetConfig === 'function'
                    ? {
                          // TODO - might cast to checksum
                          key: (args) => JSON.stringify(args),
                          client: {
                              fn: client.getWidgetConfig,
                          },
                          expire,
                      }
                    : client.getWidgetConfig,
        };
    }
}
