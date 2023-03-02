import { ModuleType } from '@equinor/fusion-framework-module';

import {
    EventModule,
    FrameworkEvent,
    FrameworkEventInit,
} from '@equinor/fusion-framework-module-event';

import { BookmarkClient } from './client/bookmarkClient';

import { BookmarkModuleConfig } from './configurator';
import { Observable, Subscription } from 'rxjs';
import { Bookmark, CreateBookmark } from './types';

export interface IBookmarkProvider {
    readonly config: BookmarkModuleConfig;
    readonly bookmarkClient: BookmarkClient;
    readonly currentBookmark$: Observable<Bookmark<unknown> | undefined>;
    readonly bookmarks$: Observable<Array<Bookmark<unknown>>>;
    currentBookmark: Bookmark<unknown> | undefined;
    addCreator<T>(cb: CreateBookmarkFn<T>, key?: keyof T): VoidFunction;
    createBookmark(args: { name: string; description: string; isShared: boolean }): Promise<void>;
    parentBookmarkProvider?: IBookmarkProvider;
    bookmarkCreators: Record<string, CreateBookmarkFn<unknown>>;
}

export type CreateBookmarkFn<T> = () => Promise<Partial<T>> | Partial<T>;

/** Application BookmarkProvider */
// On bookmark change > bookmarkId > resolve Bookmark > call bookmark handler.

export class BookmarkProvider implements IBookmarkProvider {
    #bookmarkClient: BookmarkClient;

    #event?: ModuleType<EventModule>;

    config: BookmarkModuleConfig;
    #subscriptions = new Subscription();

    bookmarkCreators: Record<string | number | symbol, CreateBookmarkFn<unknown>> = {};

    parentBookmarkProvider?: IBookmarkProvider;

    public get bookmarkClient() {
        return this.#bookmarkClient;
    }

    public get currentBookmark() {
        return this.#bookmarkClient.currentBookmark;
    }

    public get bookmarks$() {
        return this.#bookmarkClient.bookmarks$;
    }

    public get currentBookmark$() {
        return this.#bookmarkClient.currentBookmark$;
    }

    constructor(config: BookmarkModuleConfig) {
        this.config = config;
        this.#event = config.event;
        this.#bookmarkClient = config.bookmarkClient;

        // Move3 to config
        const initialBookmarkId = config.resolveBookmarkId && config.resolveBookmarkId();

        if (initialBookmarkId) {
            this.#bookmarkClient.setCurrentBookmark(initialBookmarkId);
        }

        if (this.#event) {
            this.#subscriptions.add(
                this.#event.addEventListener('onCurrentAppChanged', () => {
                    this.bookmarkCreators = {};
                })
            );
            // this.#subscriptions.add(
            //     this.#event.addEventListener('onAddCreator', (e) => {
            //         const { key, cb } = e.detail;

            //         if (e.source !== this) {
            //             this.addCreator(cb, key);
            //         }
            //     })
            // );
        }
    }

    addCreator<T>(cb: CreateBookmarkFn<T>, key?: keyof T): VoidFunction {
        const bookmarkCreatorKey = key ? key : '#creator';

        if (this.#event) {
            this.#event?.dispatchEvent('onAddCreator', {
                source: this,
                canBubble: true,
                detail: { key, cb },
            });
        }

        this.bookmarkCreators[bookmarkCreatorKey] = cb;
        return () => {
            delete this.bookmarkCreators[bookmarkCreatorKey];
        };
    }

    async createBookmark(args: { name: string; description: string; isShared: boolean }) {
        const payload = await this.#createPayload();

        const contextId = this.config.getContextId && this.config.getContextId();
        const appKey = this.config.getAppIdentification && this.config.getAppIdentification();

        if (!appKey)
            throw new Error(`There is noe current application selected, can't create bookmark.`);

        const bookmark: CreateBookmark<unknown> = {
            ...args,
            appKey,
            contextId,
            sourceSystem: this.config.sourceSystem,
            payload,
        };

        this.#bookmarkClient.createBookmark(bookmark);
    }

    async #createPayload() {
        const creator = this.bookmarkCreators || this.config.getCurrentAppCreator();
        if (!creator || Object.keys(creator).length === 0) {
            throw Error('No creator registered on this BookmarkProvider');
        }

        if (typeof creator['#creator'] === 'function') {
            return creator['#creator']();
        }

        return await Object.entries(creator).reduce(async (cur, [key, fn]) => {
            return Object.assign(await cur, { [key]: await fn() });
        }, Promise.resolve({}));
    }

    dispose() {
        this.#subscriptions.unsubscribe();
        this.#bookmarkClient.dispose();
    }
}

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        /** dispatch before context changes */
        onNavigateToApp: FrameworkEvent<FrameworkEventInit<URL, IBookmarkProvider>>;
        onAddCreator: FrameworkEvent<
            FrameworkEventInit<
                { cb: CreateBookmarkFn<unknown>; key?: keyof unknown },
                BookmarkProvider
            >
        >;
    }
}
