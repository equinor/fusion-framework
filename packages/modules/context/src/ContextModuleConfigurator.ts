import { from, lastValueFrom } from 'rxjs';

import {
  BaseConfigBuilder,
  type ModuleInitializerArgs,
  type ModulesInstanceType,
  type Modules,
  type ModuleType,
} from '@equinor/fusion-framework-module';
import type { ServicesModule, IApiProvider } from '@equinor/fusion-framework-module-services';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { getContextSelector, queryContextSelector, relatedContextSelector } from './selectors';
import type { QueryCtorOptions, QueryFn } from '@equinor/fusion-query';
import type { ContextItem, QueryContextParameters, RelatedContextParameters } from './types';
import type { GetContextParameters } from './client/ContextClient';
import resolveInitialContext from './utils/resolve-initial-context';
import type { ContextModuleConfig } from './ContextModuleConfig';
import type {
  ContextConfigBuilderCallback,
  IContextModuleConfigurator,
} from './ContextModuleConfigurator.interface';

export type { ContextModuleConfig } from './ContextModuleConfig';
export type {
  ContextConfigBuilderCallback,
  IContextModuleConfigurator,
} from './ContextModuleConfigurator.interface';

/**
 * Default implementation of {@link IContextModuleConfigurator}.
 *
 * Collects {@link ContextConfigBuilderCallback} registrations and, when
 * {@link createConfigAsync} is called, runs them in order — each callback
 * receives this configurator itself and populates the config through its
 * setter methods, which register into {@link BaseConfigBuilder._set} — to
 * produce the final {@link ContextModuleConfig}.
 *
 * If no custom client is configured, the configurator falls back to
 * creating one from the {@link ServicesModule} API provider.
 *
 * @remarks
 * Extends {@link BaseConfigBuilder} and fully reuses its `_set`/`_buildConfig`
 * machinery. Setters always pass an `async () => value` callback to `_set`,
 * never the raw value directly — `_set` decides whether it received a value
 * or a deferred callback by checking `typeof value_or_cb === 'function'`, so
 * fields that are themselves functions (e.g. `validateContext`) would
 * otherwise be misread as callbacks and invoked instead of stored.
 */
export class ContextModuleConfigurator
  extends BaseConfigBuilder<ContextModuleConfig>
  implements IContextModuleConfigurator
{
  /** Default cache TTL (in ms) for context query results. */
  defaultExpireTime = 1 * 60 * 1000;

  #configBuilders: Array<ContextConfigBuilderCallback> = [];
  #init?: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule, NavigationModule]>;

  /** @inheritdoc */
  addConfigBuilder(init: ContextConfigBuilderCallback): void {
    this.#configBuilders.push(init);
  }

  /** @inheritdoc */
  requireInstance<TKey extends string = Extract<keyof Modules, string>>(
    module: TKey,
  ): Promise<ModuleType<Modules[TKey]>>;
  /** @inheritdoc */
  requireInstance<T>(module: string): Promise<T>;
  /** @inheritdoc */
  requireInstance(
    module: string,
    // biome-ignore lint/suspicious/noExplicitAny: implementation signature must satisfy both overloads above (`Promise<ModuleType<...>>` and `Promise<T>`); `unknown` is not assignable to the generic `Promise<T>` overload
  ): Promise<any> {
    // requireInstance is only meaningful once module initialization has begun and #init is set
    if (!this.#init) {
      throw Error('requireInstance can only be called during module configuration');
    }
    // #init's requireInstance is narrowed to this module's own declared deps; widen for the public any-module overload above
    return this.#init.requireInstance(module as never);
  }

  /** @inheritdoc */
  setContextType(type: ContextModuleConfig['contextType']): void {
    this._set('contextType', async () => type);
  }

  /** @inheritdoc */
  setContextFilter(filter: ContextModuleConfig['contextFilter']): void {
    this._set('contextFilter', async () => filter);
  }

  /** @inheritdoc */
  connectParentContext(connect: ContextModuleConfig['connectParentContext']): void {
    this._set('connectParentContext', async () => connect);
  }

  /** @inheritdoc */
  setContextParameterFn(fn: ContextModuleConfig['contextParameterFn']): void {
    this._set('contextParameterFn', async () => fn);
  }

  /** @inheritdoc */
  setValidateContext(fn: ContextModuleConfig['validateContext']): void {
    this._set('validateContext', async () => fn);
  }

  /** @inheritdoc */
  setResolveContext(fn: ContextModuleConfig['resolveContext']): void {
    this._set('resolveContext', async () => fn);
  }

  /** @inheritdoc */
  setContextPathExtractor(fn: ContextModuleConfig['extractContextIdFromPath']): void {
    this._set('extractContextIdFromPath', async () => fn);
  }

  /** @inheritdoc */
  setContextPathGenerator(fn: ContextModuleConfig['generatePathFromContext']): void {
    this._set('generatePathFromContext', async () => fn);
  }

  /** @inheritdoc */
  setResolveInitialContext(fn: ContextModuleConfig['resolveInitialContext']): void {
    this._set('resolveInitialContext', async () => fn);
  }

  /** @inheritdoc */
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
    const clientConfig: ContextModuleConfig['client'] = {
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
              // TODO(#5118) - might cast to checksum
              key: (args) => JSON.stringify(args),
              client: {
                fn: client.query,
              },
              expire,
            }
          : client.query,
    };
    // only override the related-context client config if one was provided
    if (client.related) {
      clientConfig.related =
        typeof client.related === 'function'
          ? {
              // TODO(#5118) - might cast to checksum
              key: (args) => JSON.stringify(args),
              client: {
                fn: client.related,
              },
              expire,
            }
          : client.related;
    }
    this._set('client', async () => clientConfig);
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
    // prefer the local services module instance if available
    if (init.hasModule('services')) {
      return init.requireInstance('services');
    }
    const parentServiceModule = (init.ref as ModulesInstanceType<[ServicesModule]>)?.services;
    // fall back to the parent module's services instance
    if (!parentServiceModule) {
      throw Error('no service services provider configures [ServicesModule]');
    }
    return parentServiceModule;
  }

  /**
   * Runs all registered config builders, then resolves the accumulated
   * `_set` registrations into the final {@link ContextModuleConfig}.
   *
   * @param init - Module initializer arguments including dependency instances.
   * @param initial - Optional partial config inherited from a parent module.
   * @returns The fully resolved context module configuration.
   */
  protected async _createConfig(
    init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule, NavigationModule]>,
    initial?: Partial<ContextModuleConfig>,
  ): Promise<ContextModuleConfig> {
    // requireInstance resolves lazily against this init for the remainder of config building
    this.#init = init;

    // run each registered config builder in sequence; each calls setXxx(), registering into _set
    await this.#configBuilders.reduce((prev, cb) => prev.then(() => cb(this)), Promise.resolve());

    // resolve every registered _set callback into the actual config object
    const config = await lastValueFrom(from(this._buildConfig(init, initial)));

    // route through _processConfig, so a subclass overriding it (e.g. ContextMockConfigurator) still runs
    return lastValueFrom(from(this._processConfig(config, init)));
  }

  /**
   * Defaults `resolveInitialContext` and `client` when a builder callback
   * didn't set them.
   *
   * If no `resolveInitialContext` was set, the default path + parent
   * resolver is used. If no `client` was set, one is created from the
   * {@link ServicesModule} API provider.
   *
   * @param config - The config accumulated from registered builder callbacks.
   * @param init - Module initializer arguments including dependency instances.
   * @returns The fully resolved context module configuration.
   */
  protected async _processConfig(
    config: Partial<ContextModuleConfig>,
    init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule, NavigationModule]>,
  ): Promise<ContextModuleConfig> {
    config.resolveInitialContext ??= resolveInitialContext({
      path: {
        extract: config.extractContextIdFromPath,
        validate: config.extractContextIdFromPath ? () => true : undefined,
      },
    });

    // TODO(#5119) - make less lazy
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
          // TODO(#5118) - might cast to checksum
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
          // TODO(#5118) - might cast to checksum
          key: (args) => JSON.stringify(args),
          expire: this.defaultExpireTime,
        },
      };
    })();

    return config as ContextModuleConfig;
  }
}

export default ContextModuleConfigurator;
