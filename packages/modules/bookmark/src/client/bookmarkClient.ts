import {
    FrameworkEvent,
    FrameworkEventInit,
    IEventModuleProvider,
} from '@equinor/fusion-framework-module-event';
import { FetchResponse, IHttpClient } from '@equinor/fusion-framework-module-http';

import {
    ApiBookmarkEntityV1,
    BookmarksApiClient,
} from '@equinor/fusion-framework-module-services/bookmarks';
import Query from '@equinor/fusion-query';
import { BookmarkModuleConfig } from 'configurator';
import { BehaviorSubject, catchError, EMPTY, map, Observable, Subject, Subscription } from 'rxjs';

import {
    Bookmark,
    CreateBookmark,
    GetAllBookmarksParameters,
    GetBookmarkParameters,
    SourceSystem,
} from 'types';

export class BookmarkClient {
    #queryBookmarkById: Query<Bookmark<unknown>, GetBookmarkParameters>;
    #queryAllBookmarks: Query<Array<Bookmark<unknown>>, GetAllBookmarksParameters>;
    #bookmarkAPiClient: BookmarksApiClient<'fetch', IHttpClient, unknown>;

    #currentBookmark$: Subject<Bookmark<unknown> | undefined>;
    #currentBookmark: Bookmark<unknown> | undefined;
    #bookmarks$: BehaviorSubject<Array<Bookmark<unknown>>>;

    #subscriptions = new Subscription();
    #sourceSystem: SourceSystem;
    #event?: IEventModuleProvider;

    constructor(config: BookmarkModuleConfig, event?: IEventModuleProvider) {
        this.#currentBookmark$ = new Subject();

        this.#bookmarks$ = new BehaviorSubject([] as Array<Bookmark<unknown>>);
        this.#bookmarkAPiClient = config.client;
        this.#queryBookmarkById = new Query(config.queryClientConfig.getBookmarkById);
        this.#queryAllBookmarks = new Query(config.queryClientConfig.getAllBookmarks);
        this.#subscriptions = new Subscription();
        this.#sourceSystem = config.sourceSystem;
        this.#event = event;
    }

    public get currentBookmark() {
        return this.#currentBookmark;
    }

    public get currentBookmark$() {
        return this.#currentBookmark$.asObservable();
    }

    public get bookmarks$() {
        return this.#bookmarks$.asObservable();
    }

    setCurrentBookmark<T>(IdOrItem: string | Bookmark<T>) {
        if (typeof IdOrItem === 'string') {
            this.resolverBookmark<T>(IdOrItem)
                .pipe(catchError(() => EMPTY))
                .subscribe((bookmark) => {
                    if (this.#event) {
                        this.#event.dispatchEvent('onBookmarkChanged', {
                            detail: bookmark,
                            canBubble: true,
                        });
                    }

                    this.#currentBookmark$.next(bookmark);
                });
        } else if (IdOrItem !== this.currentBookmark) {
            this.#currentBookmark$.next(IdOrItem);
        }
    }

    resolverBookmark<T>(bookmarkId: string): Observable<Bookmark<T>> {
        return this.#queryBookmarkById
            .query({
                id: bookmarkId,
            })
            .pipe(
                map((bookmark) => {
                    return bookmark.value;
                })
            ) as Observable<Bookmark<T>>;
    }

    getAllBookmarks(args = { isValid: false }) {
        const { isValid } = args;
        this.#queryAllBookmarks
            .query({ isValid })
            .pipe(
                map((bookmarks) => bookmarks.value),
                catchError(() => EMPTY)
            )
            .subscribe((bookmarks) => {
                if (this.#event) {
                    this.#event.dispatchEvent('onBookmarksChanged', {
                        detail: bookmarks,
                        canBubble: true,
                    });
                }

                this.#bookmarks$.next(
                    bookmarks.filter(
                        (bookmark) =>
                            bookmark.sourceSystem.identifier === this.#sourceSystem.identifier
                    )
                );
            });
    }

    async getBookmarkById(bookmarkId: string) {
        return await this.#bookmarkAPiClient.get('v1', { id: bookmarkId });
    }

    async createBookmark<T>(bookmark: CreateBookmark<T>): Promise<ApiBookmarkEntityV1<unknown>> {
        const response = await this.#bookmarkAPiClient.post('v1', bookmark);
        return await this.#responseParser('onBookmarkCreated', response);
    }
    async updateBookmark(bookmark: Bookmark<unknown>): Promise<ApiBookmarkEntityV1<unknown>> {
        const response = await this.#bookmarkAPiClient.patch('v1', bookmark);
        return await this.#responseParser('onBookmarkUpdated', response);
    }
    async deleteBookmarkById(bookmarkId: string) {
        const response = await this.#bookmarkAPiClient.delete('v1', { id: bookmarkId });

        if (response.ok && this.#event) {
            this.#event.dispatchEvent('onBookmarkDeleted', {
                detail: bookmarkId,
                canBubble: true,
            });
        }
    }

    async #responseParser<T>(type: string, response: FetchResponse<T>) {
        if (response.ok && this.#event) {
            const resultData = await response.json();
            this.#event.dispatchEvent(type, {
                detail: resultData,
                canBubble: true,
            });
            return resultData;
        }

        return await response.json();
    }

    dispose() {
        this.#subscriptions.unsubscribe();
    }
}

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        /** dispatch before bookmark changes */
        onBookmarkChanged: FrameworkEvent<FrameworkEventInit<Bookmark<unknown>, BookmarkClient>>;
        /** dispatch before bookmarks changes */
        onBookmarksChanged: FrameworkEvent<
            FrameworkEventInit<Array<Bookmark<unknown>>, BookmarkClient>
        >;
        onBookmarkCreated: FrameworkEvent<FrameworkEventInit<Bookmark<unknown>, BookmarkClient>>;
        onBookmarkUpdated: FrameworkEvent<FrameworkEventInit<Bookmark<unknown>, BookmarkClient>>;
        onBookmarkDeleted: FrameworkEvent<FrameworkEventInit<string, BookmarkClient>>;
        onBookmarkResolved: FrameworkEvent<FrameworkEventInit<Bookmark<unknown>, BookmarkClient>>;
    }
}
