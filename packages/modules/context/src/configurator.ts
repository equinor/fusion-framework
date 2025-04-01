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

export interface ContextModuleConfig {
  client: {
    get: QueryCtorOptions<ContextItem, GetContextParameters>;
    query: QueryCtorOptions<ContextItem[], QueryContextParameters>;
    related?: QueryCtorOptions<ContextItem[], RelatedContextParameters>;
  };
  contextType?: string[];
  contextFilter?: ContextFilterFn;

  /**
   * connect context module to paren context module.
   *
   * _default: `true`_
   */
  connectParentContext?: boolean;

  /** set initial context from parent, will await resolve */
  skipInitialContext?: boolean;

  extractContextIdFromPath?: (path: string) => string | undefined;
  generatePathFromContext?: (context: ContextItem, path: string) => string | undefined;

  /**
   * Method for generating context query parameters.
   */
  contextParameterFn?: (args: {
    search: string;
    type: ContextModuleConfig['contextType'];
  }) => string | QueryContextParameters;

  resolveContext?: (
    this: IContextProvider,
    item: ContextItem | null,
  ) => ReturnType<IContextProvider['resolveContext']>;

  validateContext?: (
    this: IContextProvider,
    item: ContextItem | null,
  ) => ReturnType<IContextProvider['validateContext']>;

  resolveInitialContext?: (args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref?: AnyModuleInstance | any;
    modules: ModuleInstance;
  }) => ObservableInput<ContextItem | void>;
}

export interface IContextModuleConfigurator {
  addConfigBuilder: (init: ContextConfigBuilderCallback) => void;
}

export class ContextModuleConfigurator implements IContextModuleConfigurator {
  defaultExpireTime = 1 * 60 * 1000;

  #configBuilders: Array<ContextConfigBuilderCallback> = [];

  addConfigBuilder(init: ContextConfigBuilderCallback): void {
    this.#configBuilders.push(init);
  }

  protected async _getServiceProvider(
    init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule]>,
  ): Promise<IApiProvider> {
    if (init.hasModule('services')) {
      return init.requireInstance('services');
    } else {
      const parentServiceModule = (init.ref as ModulesInstanceType<[ServicesModule]>)?.services;
      if (parentServiceModule) {
        return parentServiceModule;
      }
      throw Error('no service services provider configures [ServicesModule]');
    }
  }

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
