import type {
    AnyModule,
    ModuleInitializerArgs,
    Modules,
    ModuleType,
} from '@equinor/fusion-framework-module';

import type { QueryCtorOptions, QueryFn } from '@equinor/fusion-query';

import type { GetContextParameters } from './client/ContextClient';

import type {
    ContextModuleConfig,
    ContextModuleConfigurator,
    IContextModuleConfigurator,
} from './configurator';

import type { ContextItem, QueryContextParameters } from './types';

export type ContextConfigBuilderCallback = <TDeps extends Array<AnyModule> = []>(
    builder: ContextConfigBuilder<TDeps, ModuleInitializerArgs<IContextModuleConfigurator, TDeps>>
) => void | Promise<void>;

export class ContextConfigBuilder<
    TModules extends Array<AnyModule> = [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TInit extends ModuleInitializerArgs<any, any> = ModuleInitializerArgs<
        ContextModuleConfigurator,
        TModules
    >
> {
    #init: TInit;
    constructor(init: TInit, public config: Partial<ContextModuleConfig> = {}) {
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

    setContextType(type: ContextModuleConfig['contextType']) {
        this.config.contextType = type;
    }

    setContextFilter(filter: ContextModuleConfig['contextFilter']) {
        this.config.contextFilter = filter;
    }

    setContextParameterFn(fn: ContextModuleConfig["contextParameterFn"])  {
        this.config.contextParameterFn = fn;
    }
    
    setContextClient(
        client: {
            get:
                | QueryFn<ContextItem, GetContextParameters>
                | QueryCtorOptions<ContextItem, GetContextParameters>;
            query:
                | QueryFn<ContextItem[], QueryContextParameters>
                | QueryCtorOptions<ContextItem[], QueryContextParameters>;
        },
        expire = 1 * 60 * 1000
    ): void {
        this.config.client = {
            get:
                typeof client.get === 'function'
                    ? {
                          key: ({ id }) => id,
                          client: {
                              fn: client.get,
                          },
                          expire,
                      }
                    : client.get,
            query:
                typeof client.query === 'function'
                    ? {
                          // TODO - might cast to checksum
                          key: (args) => JSON.stringify(args),
                          client: {
                              fn: client.query,
                          },
                          expire,
                      }
                    : client.query,
        };
    }
}
