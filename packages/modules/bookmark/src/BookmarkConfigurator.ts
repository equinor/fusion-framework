import type { z, ZodError } from 'zod';

import {
  BaseConfigBuilder,
  type ConfigBuilderCallback,
  type ConfigBuilderCallbackArgs,
  type ModulesInstanceType,
} from '@equinor/fusion-framework-module';

import type { IApiProvider, ServicesModule } from '@equinor/fusion-framework-module-services';
import type { AppModuleProvider } from '@equinor/fusion-framework-module-app';
import type { ILogger, LogLevel } from '@equinor/fusion-log';

import { BookmarkClient } from './BookmarkClient';
import type { BookmarkModule } from './bookmark-module';
import { bookmarkConfigSchema } from './bookmark-config.schema';
import type { BookmarkModuleConfig } from './types';
import type { BookmarkProvider } from './BookmarkProvider';

const initialBookmarkConfig = bookmarkConfigSchema
  .pick({
    filters: true,
    sourceSystem: true,
    resolve: true,
  })
  .partial()
  .optional();

type InitialBookmarkConfig = z.infer<typeof initialBookmarkConfig>;

/**
 * Configurator for the bookmark module.
 * This class provides a set of methods for configuring the bookmark module.
 */
export class BookmarkModuleConfigurator extends BaseConfigBuilder<BookmarkModuleConfig> {
  #log?: ILogger;
  defaultExpireTime = 1 * 60 * 1000; // Default expiration time for bookmarks

  constructor(options?: { log?: ILogger; ref?: ModulesInstanceType<[BookmarkModule]> }) {
    super();
    const { log } = options ?? {};
    this.#log = log;
    this._set('log', async () => log);
  }

  /**
   * Sets the log level for the bookmark configurator.
   *
   * @param level - The log level to set. Allowed values are:
   * - 0: No logging
   * - 1: Error messages only
   * - 2: Error and warning messages
   * - 3: Error, warning, and info messages
   * - 4: Error, warning, info, and debug messages
   */
  public setLogLevel(level: LogLevel) {
    this._set('logLevel', async () => level);
    if (this.#log) {
      this.#log.level = level;
    }
  }

  /**
   * Sets the client for interacting with bookmark operations.
   * The client argument can be either a client object with predefined methods for bookmark operations or a callback function that creates and returns such a client object.
   * This method enables the configuration of how the bookmark module interacts with the backend or any other service to perform operations such as getting, creating, or updating bookmarks.
   *
   * @param client A client object or a callback function that returns a client object.
   * - If a callback function is provided, it receives an initializer function as its argument,
   *   and it should return a Promise that resolves to a client object.
   * - If a client object is provided directly, it is wrapped in a Promise and used as-is.
   *
   * @see {@link BookmarkModuleConfig.client}
   */
  public setClient(
    client: ConfigBuilderCallback<BookmarkModuleConfig['client']> | BookmarkModuleConfig['client'],
  ) {
    if (typeof client === 'function') {
      this._set('client', (init) => client(init));
    } else {
      this._set('client', async () => client);
    }
  }

  /**
   * Sets the parent configuration for the bookmark module.
   * This allows the bookmark module to inherit configuration from a parent module.
   *
   * @param parent - A callback function or a configuration object that provides the parent configuration.
   * - If a callback function is provided, it receives an initializer function as its argument and should return a Promise that resolves to the parent configuration object.
   * - If a configuration object is provided directly, it is wrapped in a Promise and used as-is.
   */
  public setParent(
    parent: ConfigBuilderCallback<BookmarkModuleConfig['parent']> | BookmarkModuleConfig['parent'],
  ) {
    if (typeof parent === 'function') {
      this._set('parent', (init) => parent(init));
    } else {
      this._set('parent', async () => parent);
    }
  }

  /**
   * Set the source system for the bookmark module.
   * This is used to tag bookmarks with their originating system for filtering or categorization purposes.
   * @param sourceSystem - A callback function that returns the source system or a string value of the source system.
   *
   * Example:
   * ```
   * configurator.setSourceSystem('MyApplication');
   * ```
   * or
   * ```
   * configurator.setSourceSystem((init) => 'MyApplication');
   * ```
   */
  public setSourceSystem(
    sourceSystem:
      | ConfigBuilderCallback<BookmarkModuleConfig['sourceSystem']>
      | BookmarkModuleConfig['sourceSystem'],
  ) {
    if (typeof sourceSystem === 'function') {
      this._set('sourceSystem', sourceSystem);
    } else {
      this._set('sourceSystem', async () => sourceSystem);
    }
  }

  /**
   * Set the context ID resolver for the bookmark module.
   * This function is used to resolve the context ID dynamically, allowing for context-aware bookmark operations.
   * @param cb - A callback function that returns the context ID resolver function.
   *
   * Example:
   * ```
   * configurator.setContextIdResolver((init) => () => 'currentContextId');
   * ```
   */
  public setContextResolver(cb: ConfigBuilderCallback<BookmarkModuleConfig['resolve']['context']>) {
    this._set('resolve.context', cb);
  }

  /**
   * Set the application key resolver for the bookmark module.
   * This function is used to resolve the application key dynamically, providing a way to associate bookmarks with specific applications.
   * @param cb - A callback function that returns the application key resolver function.
   *
   * Example:
   * ```
   * configurator.setApplicationKeyResolver((init) => () => 'myApplicationKey');
   * ```
   */
  public setApplicationResolver(
    cb: ConfigBuilderCallback<BookmarkModuleConfig['resolve']['application']>,
  ) {
    this._set('resolve.application', cb);
  }

  /**
   * Sets a filter for the bookmark module.
   * @param key - The key of the filter to set.
   * @param value - The value to set for the filter.
   *
   * Applied when fetching bookmarks
   * - application: Only return bookmarks for the resolved application.
   * - context: Only return bookmarks for the resolved context.
   */
  public setFilter<TKey extends keyof BookmarkModuleConfig['filters']>(
    key: TKey,
    value: BookmarkModuleConfig['filters'][TKey],
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._set(`filters.${key}`, async () => value);
  }

  /**
   * Will set default configuration:
   * - `client` - a default client is set
   * - `resolveContextId` - a default context resolver is set
   * - `resolveApplicationKey` - a default application key resolver is set
   * - `sourceSystem` - a default source system is set
   * @internal method to create config, will apply defaults if not provided during build of config.
   * @param init - The config builder callback args.
   * @param initial - An optional initial config to merge into the returned config.
   * @returns The config object.
   */
  protected _createConfig(init: ConfigBuilderCallbackArgs, initial?: InitialBookmarkConfig) {
    // check if parent is provided
    if (!this._has('parent')) {
      this.#log?.debug('No parent provided, using default parent');

      // Check if parent and parent version compatible
      const parentModules = init.ref as ModulesInstanceType<[BookmarkModule]>;
      if (parentModules && 'bookmark' in parentModules) {
        const parent = parentModules.bookmark;
        if (
          'version' in parent &&
          (parent as unknown as BookmarkProvider).version.satisfies('>=2.0.0')
        ) {
          this._set('parent', async () => parent);
        } else {
          this.#log?.warn('invalid version of parent BookmarkProvider provided');
        }
      } else {
        this.#log?.info('No parent BookmarkProvider found');
      }
    }

    // Ensure a default client is set if none is provided
    if (!this._has('client')) {
      this.#log?.debug('No client provided, using default client');
      this._set('client', this._createDefaultClient.bind(this));
    }

    // Ensure a default context resolver is set if none is provided
    if (!this._has('resolve.context')) {
      this.#log?.debug('No context resolver provided, using default context resolver');
      this._set('resolve.context', this._createDefaultContextResolver.bind(this));
    }

    // Ensure a default application resolver is set if none is provided
    if (!this._has('resolve.application')) {
      this.#log?.debug('No application resolver provided, using default application resolver');
      this._set('resolve.application', this._createDefaultApplicationResolver.bind(this));
    }

    // Ensure a default event provider is set if none is provided
    if (!this._has('eventProvider')) {
      this.#log?.debug('No event provider provided, using default event provider');
      this._set('eventProvider', this._resolveEventProvider.bind(this));
    }

    // call super to create config
    return super._createConfig(init, initialBookmarkConfig.parse(initial));
  }

  /**
   * @internal Create a default context resolver for the bookmark module.
   * @param init - The configuration initialization object.
   * @returns A function that resolves the current context ID, or undefined if no context module is available.
   */
  protected async _createDefaultContextResolver(
    init: ConfigBuilderCallbackArgs,
  ): Promise<BookmarkModuleConfig['resolve']['context'] | void> {
    // Check if context module is available and use context provider if available
    if (init.hasModule('context')) {
      this.#log?.debug('Context module available, awaiting instance');
      const contextProvider = await init.requireInstance('context');

      this.#log?.debug('Context provider available, creating context resolver');
      return async () => {
        this.#log?.debug('Resolving context for bookmarks');
        const id = contextProvider.currentContext?.id;
        return id ? { id } : undefined;
      };
    }
  }

  /**
   * @internal Create a default application resolver for the bookmark module.
   * @param init - The configuration initialization object.
   * @returns A function that resolves the current application key, or undefined if no app module is available.
   */
  protected async _createDefaultApplicationResolver(
    init: ConfigBuilderCallbackArgs,
  ): Promise<BookmarkModuleConfig['resolve']['application'] | void> {
    // Check if app module is available and use app provider if available
    if (init.hasModule('app')) {
      this.#log?.debug('App module available, awaiting instance');
      const appProvider = await init.requireInstance('app');

      this.#log?.debug('App provider available, creating application resolver');
      return async () => {
        const app = appProvider.current;
        if (app) {
          return {
            appKey: app.appKey,
            name: app.manifest?.name,
          };
        }
        this.#log?.warn('No current application found');
        return undefined;
      };
    }
  }

  protected async _resolveAppProvider(
    init: ConfigBuilderCallbackArgs,
  ): Promise<AppModuleProvider | undefined> {
    // Check if app module is available
    if (init.hasModule('app')) {
      this.#log?.debug('App module available, awaiting instance');
      return init.requireInstance('app');
    }
    this.#log?.debug('No app module available, will use ref to app module if available');
    return undefined;
  }

  /**
   * @internal Create a default event provider for the bookmark module.
   * @param init - The configuration initialization object.
   * @returns A promise that resolves to the default event provider.
   */
  protected async _resolveEventProvider(
    init: ConfigBuilderCallbackArgs,
  ): Promise<BookmarkModuleConfig['eventProvider'] | void> {
    // Check if event module is available
    if (init.hasModule('event')) {
      this.#log?.debug('Event module available, awaiting instance');
      return init.requireInstance('event');
    }
  }

  /**
   * @internal Create a default client for the bookmark module.
   * @param init - The configuration initialization object.
   * @returns A promise that resolves to the default client.
   */
  protected async _createDefaultClient(
    init: ConfigBuilderCallbackArgs,
  ): Promise<BookmarkModuleConfig['client'] | void> {
    try {
      const apiProvider = await this._getServiceProvider(init);
      const api = await apiProvider.createBookmarksClient('json$');
      return new BookmarkClient(api);
    } catch (err) {
      this.#log?.warn('Failed to create bookmark api client');
    }
  }

  /**
   * @internal retrieves the service provider from the configuration initialization object.
   * @param init - The configuration initialization object.
   * @returns A promise that resolves to the service provider.
   */
  protected async _getServiceProvider(init: ConfigBuilderCallbackArgs): Promise<IApiProvider> {
    // check if services module is available
    if (init.hasModule('services')) {
      this.#log?.debug('Services module available, awaiting instance');
      return init.requireInstance('services');
    }

    this.#log?.debug('No services module available, will use ref services module if available');

    // check if parent has services module
    const parentServiceModule = (init.ref as ModulesInstanceType<[ServicesModule]>)?.services;
    if (parentServiceModule) {
      return parentServiceModule;
    }

    // No service provider available
    this.#log?.error('No service provider available, cannot create bookmarks client');
    throw Error('[BookmarkConfigurator] No service provider configures [ServicesModule] ');
  }

  protected async _processConfig(
    config: Partial<BookmarkModuleConfig>,
    _init: ConfigBuilderCallbackArgs,
  ): Promise<BookmarkModuleConfig> {
    try {
      return bookmarkConfigSchema.parse(config);
    } catch (err) {
      this.#log?.error('Failed to parse config', config, (err as ZodError).issues ?? err);
      throw err;
    }
  }
}

export default BookmarkModuleConfigurator;
