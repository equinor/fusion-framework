import {
    BaseConfigBuilder,
    ConfigBuilderCallbackArgs,
    ModulesInstanceType,
} from '@equinor/fusion-framework-module';

import { Bookmark, BookmarkModuleConfig } from './types';
import { IApiProvider, ServicesModule } from '@equinor/fusion-framework-module-services';
import { AppModule } from '@equinor/fusion-framework-module-app';
import { EventModule } from '@equinor/fusion-framework-module-event';

export class BookmarkModuleConfigurator extends BaseConfigBuilder<BookmarkModuleConfig> {
    defaultExpireTime = 1 * 60 * 1000;

    /**
     * Set the event provider for the bookmark module
     * @param cb - A callback function that returns the client for the bookmark module
     */
    public setClient(cb: (init: ConfigBuilderCallbackArgs) => BookmarkModuleConfig['client'] ) {
        this._set('client', cb);
    }

    /**
     * Set the source system for the bookmark module
     * @param cbOrSourceSystem - A callback function that returns the source system or a string value of the source system
     */
    public setSourceSystem(
        cbOrSourceSystem: (
            init: ConfigBuilderCallbackArgs,
        ) => BookmarkModuleConfig['sourceSystem'] | BookmarkModuleConfig['sourceSystem'],
    ) {
        if (typeof cbOrSourceSystem === 'function') {
            this._set('sourceSystem', cbOrSourceSystem);
        } else {
            this._set('sourceSystem', async () => cbOrSourceSystem);
        }
    }

    /**
     * Set the event provider for the bookmark module
     * @param cb - A callback function that returns the event provider for the bookmark module
     */
    public setContextIdResolver(
        cb: (init: ConfigBuilderCallbackArgs) => BookmarkModuleConfig['resolveContextId'],
    ) {
        this._set('resolveContextId', cb);
    }

    public setApplicationKeyResolver(
        cb: (init: ConfigBuilderCallbackArgs) => BookmarkModuleConfig['resolveApplicationKey'],
    ) {
        this._set('resolveApplicationKey', cb);
    }

    protected _createConfig(
        init: ConfigBuilderCallbackArgs,
        initial?: Partial<BookmarkModuleConfig>,
    ) {
        // Check if app has added configuration for bookmark api client
        // else create a default client
        if (!this.has('client')) {
            this._set('client', this._createDefaultClient.bind(this));
        }

        if (!this.has('resolveContextId')) {
            this._set('resolveContextId', async (init: ConfigBuilderCallbackArgs) => {
                // Since the consumer of this module does not have context,
                // there is no reason to resolve any context.
                if (!init.hasModule('context')) {
                    return () => undefined;
                }

                const contextProvider = await init.requireInstance('context');
                return () => contextProvider.currentContext?.id;
            });
        }

        if (!this.has('resolveApplicationKey')) {
            this._set('resolveApplicationKey', async (init: ConfigBuilderCallbackArgs) => {
                const appProvider = init.hasModule('app')
                    ? await init.requireInstance('app')
                    : (init.ref as ModulesInstanceType<[AppModule]>)?.app;

                // Since the consumer of this module does not have app,
                // there is no reason to resolve any application key.
                if (!appProvider) {
                    return () => undefined;
                }

                return () => appProvider.current?.appKey;
            });
        }

        if (!this.has('eventProvider')) {
            this._set('eventProvider', async (init: ConfigBuilderCallbackArgs) => {
                // Since the consumer of this module does not have event,
                // there is no reason to resolve any event provider.
                const eventProvider = init.hasModule('event')
                    ? await init.requireInstance('event')
                    : (init.ref as ModulesInstanceType<[EventModule]>).event;

                return eventProvider;
            });
        }

        return super._createConfig(init, initial);
    }

    protected async _createDefaultClient(
        init: ConfigBuilderCallbackArgs,
    ): Promise<BookmarkModuleConfig['client']> {
        const apiProvider = await this._getServiceProvider(init);
        const bookmarkClient = await apiProvider.createBookmarksClient('json$');

        const client: BookmarkModuleConfig['client'] = {
            getById: (id) => bookmarkClient.get('v1', { id }),
            getAll: () => bookmarkClient.getAll('v1'),
            addFavorite: (bookmarkId: string) => bookmarkClient.addFavorite('v1', { bookmarkId }),
            removeFavorite: (bookmarkId: string) =>
                bookmarkClient.removeFavorite('v1', { bookmarkId }),
            verifyFavorite: (bookmarkId: string) =>
                bookmarkClient.verifyFavorite('v1', { bookmarkId }),
            create: (bookmark: Bookmark) => bookmarkClient.post('v1', bookmark),
            update: (bookmark: Partial<Bookmark> & Pick<Bookmark, 'id'>) =>
                bookmarkClient.patch('v1', bookmark),
            delete: (bookmarkId: string) => bookmarkClient.delete('v1', { id: bookmarkId }),
        };

        return client;
    }

    protected async _getServiceProvider(init: ConfigBuilderCallbackArgs): Promise<IApiProvider> {
        if (init.hasModule('services')) {
            return init.requireInstance('services');
        } else {
            const parentServiceModule = (init.ref as ModulesInstanceType<[ServicesModule]>)
                ?.services;
            if (parentServiceModule) {
                return parentServiceModule;
            }
            throw Error('[BookmarkConfigurator] No service provider configures [ServicesModule] ');
        }
    }
}

export default BookmarkModuleConfigurator;
