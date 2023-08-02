import { ModuleInitializerArgs, Modules, ModuleType } from '@equinor/fusion-framework-module';
import { QueryFn, QueryCtorOptions } from '@equinor/fusion-query';

import { WidgetModuleConfig, IWidgetModuleConfigurator } from './WidgetModuleConfigurator';

import type { WidgetManifest, ModuleDeps, GetWidgetParameters } from './types';

export type WidgetModuleConfigBuilderCallback = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    builder: WidgetModuleConfigBuilder<ModuleInitializerArgs<IWidgetModuleConfigurator, any>>,
) => void | Promise<void>;

export type WidgetEndpointBuilder = (args: GetWidgetParameters) => string;

export class WidgetModuleConfigBuilder<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TInit extends ModuleInitializerArgs<IWidgetModuleConfigurator, any> = ModuleInitializerArgs<
        IWidgetModuleConfigurator,
        ModuleDeps
    >,
> {
    #init: TInit;
    constructor(
        init: TInit,
        public config: Partial<WidgetModuleConfig> = {},
    ) {
        this.#init = init;
    }

    requireInstance<TKey extends string = Extract<keyof Modules, string>>(
        module: TKey,
    ): Promise<ModuleType<Modules[TKey]>>;

    requireInstance<T>(module: string): Promise<T>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requireInstance(module: string): Promise<any> {
        return this.#init.requireInstance(module);
    }

    setEndpointBuilder(fn: WidgetEndpointBuilder): void {
        this.config.endpointBuilder = fn;
    }

    setWidgetClient(
        client: {
            getWidget:
                | QueryFn<WidgetManifest, { widgetKey: string }>
                | QueryCtorOptions<WidgetManifest, GetWidgetParameters>;
        },
        expire = 1 * 60 * 1000,
    ) {
        client;
        expire;

        this.config.client = {
            getWidget:
                typeof client.getWidget === 'function'
                    ? {
                          // TODO - might cast to checksum
                          key: (args) => JSON.stringify(args),
                          client: {
                              fn: client.getWidget,
                          },
                          expire,
                      }
                    : client.getWidget,
        };
    }
}
