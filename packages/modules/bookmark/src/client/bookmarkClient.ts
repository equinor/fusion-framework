import {
    FrameworkEvent,
    FrameworkEventInit,
    IEventModuleProvider,
} from '@equinor/fusion-framework-module-event';
import { IHttpClient } from '@equinor/fusion-framework-module-http';

import { BookmarksApiClient } from '@equinor/fusion-framework-module-services/bookmarks';
import { createState } from '@equinor/fusion-observable';
import { FlowState } from '@equinor/fusion-observable/src/create-state';
import Query, { type QueryCtorOptions } from '@equinor/fusion-query';

import { BehaviorSubject, catchError, EMPTY, map, Observable, Subscription } from 'rxjs';

import {
    Bookmark,
    CreateBookmark,
    GetAllBookmarksParameters,
    GetBookmarkParameters,
    SourceSystem,
} from '../types';
import { ActionBuilder, actions } from './bookmarkActions';
import { reducer, State } from './bookmarkReducer';
import {
    handleBookmarkGetAll,
    handleCreateBookmark,
    handleDeleteBookmark,
    handleUpdateBookmark,
} from './bookmarkFlows';

export type BookmarkClientConfig = {
    client: BookmarksApiClient<'fetch', IHttpClient, Bookmark<unknown>>;
    queryClientConfig: {
        getAllBookmarks: QueryCtorOptions<Array<Bookmark<unknown>>, GetAllBookmarksParameters>;
        getBookmarkById: QueryCtorOptions<Bookmark<unknown>, GetBookmarkParameters>;
    };
};

export class BookmarkClient {
    #queryBookmarkById: Query<Bookmark<unknown>, GetBookmarkParameters>;
    #queryAllBookmarks: Query<Array<Bookmark<unknown>>, GetAllBookmarksParameters>;
    #bookmarkAPiClient: BookmarksApiClient<'fetch', IHttpClient, unknown>;

    #currentBookmark$: BehaviorSubject<Bookmark<unknown> | undefined>;

    #sourceSystem: SourceSystem;
    #event?: IEventModuleProvider;

    #state: FlowState<State, ActionBuilder>;
    #subscriptions = new Subscription();

    appRoute?(appKey: string): string;

    constructor(
        config: BookmarkClientConfig,
        sourceSystem: SourceSystem,
        event?: IEventModuleProvider
    ) {
        this.#currentBookmark$ = new BehaviorSubject<Bookmark<unknown> | undefined>(undefined);

        this.#bookmarkAPiClient = config.client;
        this.#queryBookmarkById = new Query(config.queryClientConfig.getBookmarkById);
        this.#queryAllBookmarks = new Query(config.queryClientConfig.getAllBookmarks);

        this.#sourceSystem = sourceSystem;
        this.#event = event;

        this.#state = createState(actions, reducer);

        // Add Bookmark API calls as flows
        this.#addSubjectFlows();

        // Add Events to actions success
        this.#addStateEffects();
    }

    public get currentBookmark$() {
        return this.#currentBookmark$.asObservable();
    }

    public get bookmarks$() {
        return this.#state.subject.pipe(
            map((state) => Object.values(state.bookmarks).map((bookmark) => bookmark))
        );
    }

    setCurrentBookmark<T>(idOrItem?: string | Bookmark<T>) {
        if (!idOrItem) this.#currentBookmark$.next(undefined);

        if (typeof idOrItem === 'string') {
            this.resolverBookmark<T>(idOrItem)
                .pipe(catchError(() => EMPTY))
                .subscribe((bookmark) => {
                    if (this.#event) {
                        this.#event
                            .dispatchEvent('onBookmarkChanged', {
                                detail: bookmark,
                                canBubble: true,
                                cancelable: true,
                            })
                            .then(() => {
                                this.#currentBookmark$.next(bookmark);
                            });
                    } else {
                        this.#currentBookmark$.next(bookmark);
                    }
                });
        } else if (idOrItem !== this.#currentBookmark$.value) {
            this.#currentBookmark$.next(idOrItem);
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
        this.#state.dispatch.getAll(isValid);
    }

    async getBookmarkById(bookmarkId: string) {
        return await this.#bookmarkAPiClient.get('v1', { id: bookmarkId });
    }

    createBookmark<T>(bookmark: CreateBookmark<T>) {
        this.#state.dispatch.create(bookmark);
    }
    updateBookmark(bookmark: Bookmark<unknown>) {
        this.#state.dispatch.update(bookmark);
    }
    deleteBookmarkById(bookmarkId: string) {
        this.#state.dispatch.delete(bookmarkId);
    }

    dispose() {
        this.#subscriptions.unsubscribe();
    }

    #addStateEffects() {
        this.#state.subject.addEffect('create::success', (action) => {
            this.#currentBookmark$.next(action.payload);
            this.#event?.dispatchEvent('onBookmarkCreated', {
                detail: action.payload,
                canBubble: true,
                source: this,
            });
        });
        this.#state.subject.addEffect('delete::success', (action) => {
            this.#event?.dispatchEvent('onBookmarkDeleted', {
                detail: action.payload,
                canBubble: true,
                source: this,
            });
        });
        this.#state.subject.addEffect('update::success', (action) => {
            this.#event?.dispatchEvent('onBookmarkUpdated', {
                detail: action.payload,
                canBubble: true,
                source: this,
            });
        });
    }

    #addSubjectFlows() {
        this.#subscriptions.add(
            this.#state.subject.addFlow(
                handleBookmarkGetAll(this.#queryAllBookmarks, this.#sourceSystem.identifier)
            )
        );
        this.#subscriptions.add(
            this.#state.subject.addFlow(handleCreateBookmark(this.#bookmarkAPiClient))
        );
        this.#subscriptions.add(
            this.#state.subject.addFlow(handleDeleteBookmark(this.#bookmarkAPiClient))
        );
        this.#subscriptions.add(
            this.#state.subject.addFlow(handleUpdateBookmark(this.#bookmarkAPiClient))
        );
        this.#subscriptions.add(
            this.#state.subject.addFlow(handleUpdateBookmark(this.#bookmarkAPiClient))
        );
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
        onBookmarkDeleted: FrameworkEvent<FrameworkEventInit<boolean, BookmarkClient>>;
        onBookmarkResolved: FrameworkEvent<FrameworkEventInit<Bookmark<unknown>, BookmarkClient>>;
    }
}
