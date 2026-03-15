import type { ObservableInput } from 'rxjs';

import type {
  AnyModuleInstance,
  ModuleInitializerArgs,
  ModuleInstance,
  ModulesInstanceType,
} from '@equinor/fusion-framework-module';
import type { ServicesModule, IApiProvider } from '@equinor/fusion-framework-module-services';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { getContextSelector, queryContextSelector, relatedContextSelector } from './selectors';
import type { QueryCtorOptions } from '@equinor/fusion-query';
import type {
  ContextFilterFn,
  ContextItem,
  QueryContextParameters,
  RelatedContextParameters,
} from './types';
import type { GetContextParameters } from './client/ContextClient';
import { ContextConfigBuilder, type ContextConfigBuilderCallback } from './ContextConfigBuilder';
import type { IContextProvider } from './ContextProvider';
import resolveInitialContext from './utils/resolve-initial-context';

/**
 * Resolved configuration for the context module.
 *
 * Holds query clients, type filters, parent-connection settings, and
 * optional callbacks for validation, resolution, and path integration.
 * Produced by {@link ContextModuleConfigurator.createConfig} after all
 * {@link ContextConfigBuilder} callbacks have run.
 *
 * @see ContextConfigBuilder — fluent API for populating this config.
 * @see ContextProvider — runtime consumer of this config.
 */
export interface ContextModuleConfig {
  /**
   * Query client options used to fetch, search, and resolve related context items.
   *
   * - `get` — retrieves a single context item by ID.
   * - `query` — searches context items by text and optional type filter.
   * - `related` — fetches context items related to a given item (used during resolution).
   */
  client: {
    get: QueryCtorOptions<ContextItem, GetContextParameters>;
    query: QueryCtorOptions<ContextItem[], QueryContextParameters>;
    related?: QueryCtorOptions<ContextItem[], RelatedContextParameters>;
  };

  /**
   * Allowed context type IDs (e.g. `['ProjectMaster', 'Facility']`).
   *
   * When set, {@link ContextProvider.validateContext} only accepts items
   * whose `type.id` matches one of these values (case-insensitive).
   */
  contextType?: string[];

  /**
   * Optional post-query filter applied to the result set returned by
   * {@link ContextProvider.queryContext}.
   */
  contextFilter?: ContextFilterFn;

  /**
   * Whether to connect the context module to a parent context module.
   *
   * When `true` (the default), the provider subscribes to the parent's
   * `currentContext$` and mirrors changes into its own state.
   *
   * @defaultValue `true`
   */
  connectParentContext?: boolean;

  /**
   * When `true`, skips resolving an initial context from the path or parent
   * during module post-initialization.
   */
  skipInitialContext?: boolean;

  /**
   * Extracts a context ID from a URL path segment.
   *
   * Used during initial context resolution and deep-link support.
   * If not provided, the default GUID-based extractor is used.
   *
   * @param path - The URL path to inspect.
   * @returns The extracted context ID, or `undefined` if none is found.
   */
  extractContextIdFromPath?: (path: string) => string | undefined;

  /**
   * Generates a URL path that embeds the given context item's ID.
   *
   * Used by navigation integrations to update the browser URL when
   * the context changes.
   *
   * @param context - The active context item.
   * @param path - The current URL path.
   * @returns The updated path, or `undefined` to leave it unchanged.
   */
  generatePathFromContext?: (context: ContextItem, path: string) => string | undefined;

  /**
   * Transforms a user search string and the configured context type into
   * the query parameters sent to the context API.
   *
   * Override this to customise how free-text searches are mapped to the
   * backend query contract.
   */
  contextParameterFn?: (args: {
    search: string;
    type: ContextModuleConfig['contextType'];
  }) => string | QueryContextParameters;

  /**
   * Custom context resolution strategy.
   *
   * Called with `this` bound to the {@link IContextProvider} when a context
   * item fails validation and the caller requests resolution.
   *
   * @param item - The context item to resolve, or `null`.
   * @returns An observable emitting the resolved context item.
   */
  resolveContext?: (
    this: IContextProvider,
    item: ContextItem | null,
  ) => ReturnType<IContextProvider['resolveContext']>;

  /**
   * Custom context validation strategy.
   *
   * Called with `this` bound to the {@link IContextProvider} to decide
   * whether a candidate context item is acceptable.
   *
   * @param item - The context item to validate, or `null`.
   * @returns `true` if the item is valid.
   */
  validateContext?: (
    this: IContextProvider,
    item: ContextItem | null,
  ) => ReturnType<IContextProvider['validateContext']>;

  /**
   * Resolves the initial context during module post-initialization.
   *
   * The default implementation tries to extract a context ID from the
   * current navigation path, falling back to the parent provider's context.
   *
   * @param args - Module reference and instance map.
   * @returns An observable input emitting the initial context item, or void.
   */
  resolveInitialContext?: (args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref?: AnyModuleInstance | any;
    modules: ModuleInstance;
  }) => ObservableInput<ContextItem | void>;
}

/**
 * Public configurator contract for the context module.
 *
 * Consumers call {@link addConfigBuilder} to register one or more
 * {@link ContextConfigBuilderCallback} functions that will run during
 * module initialization to populate the {@link ContextModuleConfig}.
 */
export interface IContextModuleConfigurator {
  /**
   * Registers a configuration callback that receives a {@link ContextConfigBuilder}.
   *
   * Multiple builders can be added; they execute sequentially and merge
   * their results into a single {@link ContextModuleConfig}.
   *
   * @param init - Builder callback invoked during module initialization.
   */
  addConfigBuilder: (init: ContextConfigBuilderCallback) => void;
}

/**
 * Default implementation of {@link IContextModuleConfigurator}.
 *
 * Collects {@link ContextConfigBuilderCallback} registrations and, when
 * {@link createConfig} is called, runs them in order against a
 * {@link ContextConfigBuilder} to produce the final {@link ContextModuleConfig}.
 *
 * If no custom client is configured, the configurator falls back to
 * creating one from the {@link ServicesModule} API provider.
 */
export class ContextModuleConfigurator implements IContextModuleConfigurator {
  /** Default cache TTL (in ms) for context query results. */
  defaultExpireTime = 1 * 60 * 1000;

  #configBuilders: Array<ContextConfigBuilderCallback> = [];

  /** @inheritdoc */
  addConfigBuilder(init: ContextConfigBuilderCallback): void {
    this.#configBuilders.push(init);
  }

  /**
   * Resolves the services API provider, preferring the local module
   * instance and falling back to the parent module.
   *
   * @param init - Module initializer arguments.
   * @returns The resolved API provider.
   * @throws Error if no services module is available.
   */
  protected async _getServiceProvider(
    init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule]>,
  ): Promise<IApiProvider> {
    if (init.hasModule('services')) {
      return init.requireInstance('services');
    }
    const parentServiceModule = (init.ref as ModulesInstanceType<[ServicesModule]>)?.services;
    if (!parentServiceModule) {
      throw Error('no service services provider configures [ServicesModule]');
    }
    return parentServiceModule;
  }

  /**
   * Runs all registered config builders and produces the final
   * {@link ContextModuleConfig}.
   *
   * If no `resolveInitialContext` was set, the default path + parent
   * resolver is used. If no `client` was set, one is created from the
   * {@link ServicesModule} API provider.
   *
   * @param init - Module initializer arguments including dependency instances.
   * @returns The fully resolved context module configuration.
   */
  public async createConfig(
    init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule, NavigationModule]>,
  ): Promise<ContextModuleConfig> {
    const config = await this.#configBuilders.reduce(
      async (cur, cb) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const builder = new ContextConfigBuilder<any, any>(init, await cur);
        await Promise.resolve(cb(builder));
        return Object.assign(cur, builder.config);
      },
      Promise.resolve({} as Partial<ContextModuleConfig>),
    );

    config.resolveInitialContext ??= resolveInitialContext({
      path: {
        extract: config.extractContextIdFromPath,
        validate: config.extractContextIdFromPath ? () => true : undefined,
      },
    });

    // TODO - make less lazy
    config.client ??= await (async (): Promise<ContextModuleConfig['client']> => {
      const apiProvider = await this._getServiceProvider(init);
      const contextClient = await apiProvider.createContextClient('json$');
      return {
        get: {
          client: {
            fn: (args) => contextClient.get('v1', args, { selector: getContextSelector }),
          },
          key: ({ id }) => id,
          expire: this.defaultExpireTime,
        },
        query: {
          client: {
            fn: (query) => contextClient.query('v1', { query }, { selector: queryContextSelector }),
          },
          // TODO - might cast to checksum
          key: (args) => JSON.stringify(args),
          expire: this.defaultExpireTime,
        },
        related: {
          client: {
            fn: (args) => {
              return contextClient.related(
                'v1',
                { id: args.item.id, query: { filter: args.filter } },
                { selector: relatedContextSelector },
              );
            },
          },
          // TODO - might cast to checksum
          key: (args) => JSON.stringify(args),
          expire: this.defaultExpireTime,
        },
      };
    })();

    return config as ContextModuleConfig;
  }
}

export default ContextModuleConfigurator;
