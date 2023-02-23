import { ModuleType } from '@equinor/fusion-framework-module';
import { App, AppModule, AppModuleProvider } from '@equinor/fusion-framework-module-app';
import { ContextModule, IContextProvider } from '@equinor/fusion-framework-module-context';
import {
    EventModule,
    FrameworkEvent,
    FrameworkEventInit,
} from '@equinor/fusion-framework-module-event';

import { BookmarkClient } from './client/bookmarkClient';

import { BookmarkModuleConfig } from './configurator';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Bookmark, CreateBookmark } from './types';

import { BookmarkModule } from 'index';
import { removeBookmarkIdFromURL } from './utils/handle-url';

export interface IBookmarkProvider {
    readonly config: BookmarkModuleConfig;
    readonly bookmarkClient: BookmarkClient;
    readonly currentBookmark$: Observable<Bookmark<unknown> | undefined>;
    readonly bookmarks$: Observable<Array<Bookmark<unknown>>>;
    currentBookmark: Bookmark<unknown> | undefined;
    addCreator<T>(cb: CreateBookmarkFn<T>, key?: keyof T): VoidFunction;
    hasBookmark$: Observable<boolean>;
    hasBookmark: boolean;
    createBookmark(args: { name: string; description: string; isShared: boolean }): Promise<void>;
    parentBookmarkProvider?: IBookmarkProvider;
    bookmarkCreators: Record<string, CreateBookmarkFn<unknown>>;
}

type CreateBookmarkFn<T> = () => Promise<Partial<T>> | Partial<T>;

/** Application BookmarkProvider */
// On bookmark change > bookmarkId > resolve Bookmark > call bookmark handler.

export class BookmarkProvider implements IBookmarkProvider {
    #bookmarkClient: BookmarkClient;

    #event?: ModuleType<EventModule>;

    #contextModule?: IContextProvider;
    #appModule?: AppModuleProvider;
    config: BookmarkModuleConfig;
    #subscriptions = new Subscription();

    bookmarkCreators: Record<string | number | symbol, CreateBookmarkFn<unknown>> = {};
    #hasBookmark$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    parentBookmarkProvider?: IBookmarkProvider;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #app: App<any, [BookmarkModule]> | undefined;

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

    public get hasBookmark$() {
        return this.#hasBookmark$.asObservable();
    }

    public get hasBookmark() {
        return this.#hasBookmark$.value;
    }

    constructor(args: {
        config: BookmarkModuleConfig;
        event?: ModuleType<EventModule>;
        contextModule?: ModuleType<ContextModule>;
        appModule?: ModuleType<AppModule>;
        ref?: IBookmarkProvider;
    }) {
        const { config, event, ref, contextModule } = args;

        this.config = config;
        this.#event = event;
        this.#contextModule = contextModule;

        if (ref) {
            this.parentBookmarkProvider = ref;
            this.config.sourceSystem = ref.config.sourceSystem;
        }

        this.#bookmarkClient = ref
            ? ref.bookmarkClient
            : new BookmarkClient(this.config, this.#event);

        const initialBookmarkId = config.resolveBookmarkId && config.resolveBookmarkId();

        if (initialBookmarkId) {
            this.#bookmarkClient.setCurrentBookmark(initialBookmarkId);
        }

        if (this.#event) {
            this.#event.addEventListener('onBookmarkChanged', (e) => {
                const { appKey } = e.detail;

                if (this.#shouldNavigate(appKey)) {
                    this.#navigateToApplication(appKey);
                }
                this.#hasBookmark$.next(false);
            });

            this.#event.addEventListener('onBookmarkCreated', (e) => {
                this.#bookmarkClient.setCurrentBookmark(e.detail);
                this.#bookmarkClient.getAllBookmarks({ isValid: true });
            });

            this.#event.addEventListener('onBookmarkUpdated', (e) => {
                this.#bookmarkClient.setCurrentBookmark(e.detail);
                this.#bookmarkClient.getAllBookmarks({ isValid: true });
            });
            this.#event.addEventListener('onBookmarkDeleted', () => {
                this.#bookmarkClient.getAllBookmarks({ isValid: true });
            });

            this.#event.addEventListener('onCurrentAppChanged', (e) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.#app = e.detail.next as App<any, [BookmarkModule]>;
            });

            this.#event.addEventListener('onAddCreator', (e) => {
                const { cb, key } = e.detail;
                if (e.source !== this) {
                    this.addCreator(cb, key);
                    this.#hasBookmark$.next(true);
                }
            });
        }
    }

    #navigateToApplication(appKey?: string) {
        if (!appKey) return;

        if (this.config.appRoute) {
            const url = new URL(this.config.appRoute(appKey), window.location.origin);
            url.search = window.location.search;

            this.#event?.dispatchEvent('onNavigateToApp', {
                source: this,
                canBubble: true,
                detail: url,
            });
            return;
        }

        removeBookmarkIdFromURL();
    }

    #shouldNavigate(appKey?: string): boolean {
        if (!appKey) return false;
        return !window.location.pathname.includes(appKey);
    }

    addCreator<T>(cb: CreateBookmarkFn<T>, key?: keyof T): VoidFunction {
        const bookmarkCreatorKey = key ? key : '#creator';

        this.#event?.dispatchEvent('onAddCreator', {
            source: this,
            canBubble: true,
            detail: { key, cb },
        });

        this.bookmarkCreators[bookmarkCreatorKey] = cb;
        return () => {
            delete this.bookmarkCreators[bookmarkCreatorKey];
        };
    }

    async createBookmark(args: { name: string; description: string; isShared: boolean }) {
        const payload = await this.#createPayload();

        const currentContext = this.#contextModule?.currentContext;
        const appKey = this.#app?.appKey && this.#appModule?.current?.appKey;

        if (!appKey)
            throw new Error(`There is noe current application selected, can't create bookmark.`);

        const bookmark: CreateBookmark<unknown> = {
            ...args,
            appKey,
            contextId: currentContext?.id,
            sourceSystem: this.config.sourceSystem,
            payload,
        };

        await this.#bookmarkClient.createBookmark(bookmark);
    }

    async #createPayload() {
        const creator = this.bookmarkCreators;
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
