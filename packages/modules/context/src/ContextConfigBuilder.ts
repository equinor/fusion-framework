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

import type { ContextItem, QueryContextParameters, RelatedContextParameters } from './types';

export type ContextConfigBuilderCallback = <TDeps extends Array<AnyModule> = []>(
  builder: ContextConfigBuilder<TDeps, ModuleInitializerArgs<IContextModuleConfigurator, TDeps>>,
) => void | Promise<void>;

/**
 * A builder class for configuring and customizing context module behavior within the Fusion Framework.
 *
 * `ContextConfigBuilder` provides a fluent API for setting up various aspects of context management,
 * including context type, filtering, parent context connection, parameter resolution, validation,
 * path extraction/generation, and client configuration for fetching context items.
 *
 * @typeParam TModules - An array of modules that extend `AnyModule`. Defaults to an empty array.
 * @typeParam TInit - The initializer arguments for the module, extending `ModuleInitializerArgs`.
 *
 * @example
 * ```typescript
 * const builder = new ContextConfigBuilder(init);
 * builder.setContextType(['ProjectMaster']);
 * builder.setContextFilter(items => items.filter(ctx => ctx.isActive));
 * builder.setContextClient({ get: fetchContextItem, query: fetchContextItems });
 * ```
 *
 * @remarks
 * - Use the provided setter methods to customize context behavior as needed.
 * - The builder pattern allows chaining configuration methods for clarity and convenience.
 * - The `requireInstance` method enables asynchronous retrieval of module instances by name.
 *
 * @todo - this should extend the BaseConfigBuilder
 *
 * @see ContextModuleConfig
 * @see ModuleInitializerArgs
 */
export class ContextConfigBuilder<
  TModules extends Array<AnyModule> = [],
  TInit extends ModuleInitializerArgs<any, any> = ModuleInitializerArgs<
    ContextModuleConfigurator,
    TModules
  >,
> {
  #init: TInit;
  constructor(
    init: TInit,
    public config: Partial<ContextModuleConfig> = {},
  ) {
    this.#init = init;
  }

  requireInstance<TKey extends string = Extract<keyof Modules, string>>(
    module: TKey,
  ): Promise<ModuleType<Modules[TKey]>>;

  requireInstance<T>(module: string): Promise<T>;

  requireInstance(module: string): Promise<any> {
    return this.#init.requireInstance(module);
  }

  /**
   * Sets the context type for the current configuration.
   *
   * @param type - The context type to assign, as defined by `ContextModuleConfig['contextType']`.
   */
  setContextType(type: ContextModuleConfig['contextType']) {
    this.config.contextType = type;
  }

  /**
   * Sets the context filter function for the configuration.
   *
   * @param filter - A function that determines whether a context should be included, as defined by `ContextModuleConfig['contextFilter']`.
   */
  setContextFilter(filter: ContextModuleConfig['contextFilter']) {
    this.config.contextFilter = filter;
  }

  /**
   * Sets the function or configuration used to connect to a parent context.
   *
   * @param connect - The function or configuration that defines how to connect to the parent context.
   */
  connectParentContext(connect: ContextModuleConfig['connectParentContext']) {
    this.config.connectParentContext = connect;
  }

  /**
   * Sets the function used to provide context parameters for the module configuration.
   *
   * @param fn - A function conforming to the `contextParameterFn` type defined in `ContextModuleConfig`.
   */
  setContextParameterFn(fn: ContextModuleConfig['contextParameterFn']) {
    this.config.contextParameterFn = fn;
  }

  /**
   * Sets the function used to validate the context within the configuration.
   *
   * @param fn - A function that implements the `validateContext` signature from `ContextModuleConfig`.
   */
  setValidateContext(fn: ContextModuleConfig['validateContext']) {
    this.config.validateContext = fn;
  }

  /**
   * Sets the function used to resolve the context for the module configuration.
   *
   * @param fn - A function that defines how the context should be resolved, conforming to the `resolveContext` type from `ContextModuleConfig`.
   */
  setResolveContext(fn: ContextModuleConfig['resolveContext']) {
    this.config.resolveContext = fn;
  }

  /**
   * Sets the function responsible for extracting the context ID from a given path.
   *
   * @param fn - A function that defines how to extract the context ID from a path.
   *             This function should match the type defined in `ContextModuleConfig['extractContextIdFromPath']`.
   */
  setContextPathExtractor(fn: ContextModuleConfig['extractContextIdFromPath']) {
    this.config.extractContextIdFromPath = fn;
  }

  /**
   * Sets the function responsible for generating a path from the context.
   *
   * @param fn - A function that takes a context and generates a corresponding path.
   */
  setContextPathGenerator(fn: ContextModuleConfig['generatePathFromContext']) {
    this.config.generatePathFromContext = fn;
  }

  setResolveInitialContext(fn: ContextModuleConfig['resolveInitialContext']) {
    this.config.resolveInitialContext = fn;
  }

  /**
   * Sets the context client configuration for fetching context items.
   *
   * This method allows you to provide custom query functions or query constructor options
   * for retrieving single context items (`get`), querying multiple context items (`query`),
   * and optionally fetching related context items (`related`). Each query can be provided
   * as either a function or a configuration object. The expiration time for cached results
   * can also be specified.
   *
   * @param client - An object containing the query functions or options for `get`, `query`, and optionally `related` context items.
   * @param expire - Optional. The expiration time (in milliseconds) for cached query results. Defaults to 1 minute.
   */
  setContextClient(
    client: {
      get:
        | QueryFn<ContextItem, GetContextParameters>
        | QueryCtorOptions<ContextItem, GetContextParameters>;
      query:
        | QueryFn<ContextItem[], QueryContextParameters>
        | QueryCtorOptions<ContextItem[], QueryContextParameters>;
      related?:
        | QueryFn<ContextItem[], RelatedContextParameters>
        | QueryCtorOptions<ContextItem[], RelatedContextParameters>;
    },
    expire = 1 * 60 * 1000,
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
    if (client.related) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.config.client!.related =
        typeof client.related === 'function'
          ? {
              // TODO - might cast to checksum
              key: (args) => JSON.stringify(args),
              client: {
                fn: client.related,
              },
              expire,
            }
          : client.related;
    }
  }
}
