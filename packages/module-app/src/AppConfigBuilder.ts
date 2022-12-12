import { ModuleInitializerArgs, Modules, ModuleType } from '@equinor/fusion-framework-module';
import { QueryFn, QueryCtorOptions } from '@equinor/fusion-query';

import { AppModuleConfig, IAppConfigurator } from './AppConfigurator';

import type { AppConfig, AppManifest, ModuleDeps } from './types';

export type AppConfigBuilderCallback = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    builder: AppConfigBuilder<ModuleInitializerArgs<IAppConfigurator, any>>
) => void | Promise<void>;

export class AppConfigBuilder<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TInit extends ModuleInitializerArgs<IAppConfigurator, any> = ModuleInitializerArgs<
        IAppConfigurator,
        ModuleDeps
    >
> {
    #init: TInit;
    constructor(init: TInit, public config: Partial<AppModuleConfig> = {}) {
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

    setAppClient(
        client: {
            getAppManifest:
                | QueryFn<AppManifest, { appKey: string }>
                | QueryCtorOptions<AppManifest, { appKey: string }>;
            getAppManifests: QueryFn<AppManifest[], void> | QueryCtorOptions<AppManifest[], void>;
            getAppConfig:
                | QueryFn<AppConfig, { appKey: string }>
                | QueryCtorOptions<AppConfig, { appKey: string; tag?: string }>;
        },
        expire = 1 * 60 * 1000
    ) {
        client;
        expire;

        this.config.client = {
            getAppManifest:
                typeof client.getAppManifest === 'function'
                    ? {
                          key: ({ appKey }) => appKey,
                          client: {
                              fn: client.getAppManifest,
                          },
                          expire,
                      }
                    : client.getAppManifest,
            getAppManifests:
                typeof client.getAppManifests === 'function'
                    ? {
                          // TODO - might cast to checksum
                          key: () => 'app_manifests',
                          client: {
                              fn: client.getAppManifests,
                          },
                          expire,
                      }
                    : client.getAppManifests,
            getAppConfig:
                typeof client.getAppConfig === 'function'
                    ? {
                          // TODO - might cast to checksum
                          key: (args) => JSON.stringify(args),
                          client: {
                              fn: client.getAppConfig,
                          },
                          expire,
                      }
                    : client.getAppConfig,
        };
    }
}
