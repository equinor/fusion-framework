import {
    BaseConfigBuilder,
    ConfigBuilderCallback,
    ConfigBuilderCallbackArgs,
    ModulesInstanceType,
} from '@equinor/fusion-framework-module';

import { IApiProvider, ServicesModule } from '@equinor/fusion-framework-module-services';
import { AppModule, AppModuleProvider } from '@equinor/fusion-framework-module-app';

/**
 * These types are used for configuring and interacting with an event module or provider within the bookmark module.
 */
import {
    type EventModule,
    type IEventModuleProvider,
} from '@equinor/fusion-framework-module-event';

import { BookmarkClient } from './BookmarkClient';
import { IBookmarkClient } from './BookmarkClient.interface';

import type { Bookmark } from './types';
import { ILogger } from '../../../utils/log/src';
import { BookmarkProvider } from './BookmarkProvider';
import { BookmarkModule } from './module';

/**
 * Configuration options for the bookmark module provider.
 */
export type BookmarkModuleConfig = {
    /**
     * Sets the logger to use for logging.
     */
    log?: ILogger;

    /**
     * Sets the event provider to use for bookmark events.
     */
    eventProvider?: IEventModuleProvider;

    /**
     * The `BookmarkProvider` instance that is the parent of the current modules
     */
    parent?: BookmarkProvider | null;

    /**
     * Sets the client to use for accessing bookmarks.
     */
    client: IBookmarkClient;

    /**
     * Sets the source system of the bookmarks.
     */
    sourceSystem?: Bookmark['sourceSystem'];

    /**
     * Sets the function to use for resolving target context.
     */
    resolveContext: () => Promise<{ id: string } | undefined>;

    /**
     * Sets the function to use for resolving target application.
     */
    resolveApplication: () => Promise<{ appKey: string } | undefined>;
};

/**
 * Configurator for the bookmark module.
 * This class provides a set of methods for configuring the bookmark module.
 *
 * @example
 * ```typescript
 * import { BookmarkModuleConfigurator } from '@equinor/fusion-bookmark';
 *
 * const configurator = new BookmarkModuleConfigurator();
 * configurator.setSourceSystem({
 *  identifier: 'MySystem',
 * });
 * const config = await lastValue(from(configurator.createConfig(init))); // where init comes from modules configurator
 * ```
 */
export class BookmarkModuleConfigurator extends BaseConfigBuilder<BookmarkModuleConfig> {
    #log?: ILogger;
    defaultExpireTime = 1 * 60 * 1000; // Default expiration time for bookmarks

    constructor(options?: { log?: ILogger; ref?: ModulesInstanceType<[BookmarkModule]> }) {
        super();
        const { log, ref } = options ?? {};
        this.#log = log;
        this._set('log', () => log);
        if (ref) {
            this._set('parent', async () => ref.bookmark ?? null);
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
     *
     * @example
     * ```typescript
     * configurator.setClient({
     *   getById: (id) => bookmarkClient.get('v1', { id }),
     *   getAll: () => bookmarkClient.getAll('v1'),
     *   addFavorite: (bookmarkId: string) => bookmarkClient.addFavorite('v1', { bookmarkId }),
     *   removeFavorite: (bookmarkId: string) =>
     *       bookmarkClient.removeFavorite('v1', { bookmarkId }),
     *   verifyFavorite: (bookmarkId: string) =>
     *       bookmarkClient.verifyFavorite('v1', { bookmarkId }),
     *   create: (bookmark: Bookmark) => bookmarkClient.post('v1', bookmark),
     *   update: (bookmark: Partial<Bookmark> & Pick<Bookmark, 'id'>) =>
     *       bookmarkClient.patch('v1', bookmark),
     *   delete: (bookmarkId: string) => bookmarkClient.delete('v1', { id: bookmarkId }),
     * });
     * ```
     */
    public setClient(
        client:
            | ConfigBuilderCallback<BookmarkModuleConfig['client']>
            | BookmarkModuleConfig['client'],
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
        parent:
            | ConfigBuilderCallback<BookmarkModuleConfig['parent']>
            | BookmarkModuleConfig['parent']
            | null,
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
    public setContextIdResolver(cb: ConfigBuilderCallback<BookmarkModuleConfig['resolveContext']>) {
        this._set('resolveContext', cb);
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
    public setApplicationKeyResolver(
        cb: ConfigBuilderCallback<BookmarkModuleConfig['resolveApplication']>,
    ) {
        this._set('resolveApplication', cb);
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
    protected _createConfig(
        init: ConfigBuilderCallbackArgs,
        initial?: Partial<BookmarkModuleConfig>,
    ) {
        if (!this._has('parent')) {
            this.#log?.debug('No parent provided, using default parent');
            const parentModules = init.ref as ModulesInstanceType<[BookmarkModule]>;
            if ('bookmark' in parentModules) {
                const parent = parentModules.bookmark;
                if ('version' in parent && parent.version.satisfies('>=2.0.0')) {
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
        if (!this._has('resolveContext')) {
            this.#log?.debug('No context resolver provided, using default context resolver');
            this._set('resolveContext', this._createDefaultContextResolver.bind(this));
        }

        // Ensure a default application resolver is set if none is provided
        if (!this._has('resolveApplication')) {
            this.#log?.debug(
                'No application resolver provided, using default application resolver',
            );
            this._set('resolveApplication', this._createDefaultApplicationResolver.bind(this));
        }

        // Ensure a default event provider is set if none is provided
        if (!this._has('eventProvider')) {
            this.#log?.debug('No event provider provided, using default event provider');
            this._set('eventProvider', this._resolveEventProvider.bind(this));
        }

        // call super to create config
        return super._createConfig(init, initial);
    }

    /**
     * @internal Create a default context resolver for the bookmark module.
     * @param init - The configuration initialization object.
     * @returns A function that resolves the current context ID, or undefined if no context module is available.
     */
    protected async _createDefaultContextResolver(
        init: ConfigBuilderCallbackArgs,
    ): Promise<BookmarkModuleConfig['resolveContext']> {
        if (!init.hasModule('context')) {
            this.#log?.info('No context module available, context for bookmarks will be undefined');
            return async () => undefined; // No context module available
        }

        const contextProvider = await init.requireInstance('context');
        return async () => {
            this.#log?.debug('Resolving context for bookmarks');
            const id = contextProvider.currentContext?.id;
            return id ? { id } : undefined;
        };
    }

    /**
     * @internal Create a default application resolver for the bookmark module.
     * @param init - The configuration initialization object.
     * @returns A function that resolves the current application key, or undefined if no app module is available.
     */
    protected async _createDefaultApplicationResolver(
        init: ConfigBuilderCallbackArgs,
    ): Promise<BookmarkModuleConfig['resolveApplication']> {
        const appProvider = await this._resolveAppProvider(init);

        if (!appProvider) {
            this.#log?.info('No app module available, application for bookmarks will be undefined');
            return async () => undefined; // No app module available
        }

        return async () => {
            const appKey = appProvider.current?.appKey;
            return appKey ? { appKey } : undefined;
        };
    }

    protected _resolveAppProvider(
        init: ConfigBuilderCallbackArgs,
    ): Promise<AppModuleProvider | undefined> {
        if (init.hasModule('app')) {
            this.#log?.debug('App module available, awaiting instance');
            return init.requireInstance('app');
        } else {
            this.#log?.debug('No app module available, will use ref to app module if available');
            return Promise.resolve((init.ref as ModulesInstanceType<[AppModule]>)?.app);
        }
    }

    /**
     * @internal Create a default event provider for the bookmark module.
     * @param init - The configuration initialization object.
     * @returns A promise that resolves to the default event provider.
     */
    protected async _resolveEventProvider(
        init: ConfigBuilderCallbackArgs,
    ): Promise<BookmarkModuleConfig['eventProvider']> {
        if (init.hasModule('event')) {
            this.#log?.debug('Event module available, awaiting instance');
            return await init.requireInstance('event');
        } else {
            this.#log?.debug(
                'No event module available, will use ref to event module if available',
            );
            return (init.ref as ModulesInstanceType<[EventModule]>).event;
        }
    }

    /**
     * @internal Create a default client for the bookmark module.
     * @param init - The configuration initialization object.
     * @returns A promise that resolves to the default client.
     */
    protected async _createDefaultClient(
        init: ConfigBuilderCallbackArgs,
    ): Promise<BookmarkModuleConfig['client']> {
        const apiProvider = await this._getServiceProvider(init);
        const api = await apiProvider.createBookmarksClient('json$');
        return new BookmarkClient(api);
    }

    /**
     * @internal retrieves the service provider from the configuration initialization object.
     * @param init - The configuration initialization object.
     * @returns A promise that resolves to the service provider.
     */
    protected async _getServiceProvider(init: ConfigBuilderCallbackArgs): Promise<IApiProvider> {
        if (init.hasModule('services')) {
            this.#log?.debug('Services module available, awaiting instance');
            return init.requireInstance('services');
        } else {
            this.#log?.debug(
                'No services module available, will use ref to services module if available',
            );
            const parentServiceModule = (init.ref as ModulesInstanceType<[ServicesModule]>)
                ?.services;
            if (parentServiceModule) {
                return parentServiceModule;
            }
            this.#log?.error('No service provider available, cannot create bookmarks client');
            throw Error('[BookmarkConfigurator] No service provider configures [ServicesModule] ');
        }
    }
}

export default BookmarkModuleConfigurator;
