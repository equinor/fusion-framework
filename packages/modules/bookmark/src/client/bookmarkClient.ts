import {
    FrameworkEvent,
    FrameworkEventInit,
    IEventModuleProvider,
} from '@equinor/fusion-framework-module-event';
import { IHttpClient } from '@equinor/fusion-framework-module-http';

import { BookmarksApiClient } from '@equinor/fusion-framework-module-services/bookmarks';
import { createState } from '@equinor/fusion-observable';
import { FlowState } from '@equinor/fusion-observable/src/create-state';
import Query from '@equinor/fusion-query';
import { BookmarkModuleConfig } from 'configurator';
import { catchError, EMPTY, map, Observable, Subject, Subscription } from 'rxjs';

import {
    Bookmark,
    CreateBookmark,
    GetAllBookmarksParameters,
    GetBookmarkParameters,
    SourceSystem,
} from '../types';
import { ActionBuilder, actions } from './bookmarkActions';
import { reducer } from './bookmarkReducer';
import {
    handleBookmarkGetAll,
    handleCreateBookmark,
    handleDeleteBookmark,
    handleGetAllOnSuccessCreateUpdateDelete,
    handleUpdateBookmark,
} from './bookmarkFlows';

export class BookmarkClient {
    #queryBookmarkById: Query<Bookmark<unknown>, GetBookmarkParameters>;
    #queryAllBookmarks: Query<Array<Bookmark<unknown>>, GetAllBookmarksParameters>;
    #bookmarkAPiClient: BookmarksApiClient<'fetch', IHttpClient, unknown>;

    #currentBookmark$: Subject<Bookmark<unknown> | undefined>;
    #currentBookmark: Bookmark<unknown> | undefined;

    #sourceSystem: SourceSystem;
    #event?: IEventModuleProvider;

    #state: FlowState<Record<string, Bookmark>, ActionBuilder>;
    #subscriptions = new Subscription();

    constructor(config: BookmarkModuleConfig) {
        this.#currentBookmark$ = new Subject();

        this.#bookmarkAPiClient = config.client;
        this.#queryBookmarkById = new Query(config.queryClientConfig.getBookmarkById);
        this.#queryAllBookmarks = new Query(config.queryClientConfig.getAllBookmarks);

        this.#sourceSystem = config.sourceSystem;
        this.#event = config.event;

        this.#state = createState(actions, reducer);

        // Add Bookmark API calls as flows
        this.addSubjectFlows();

        // Add Events to flows success
        this.addStateEffects();
    }

    public get currentBookmark() {
        return this.#currentBookmark;
    }

    public get currentBookmark$() {
        return this.#currentBookmark$.asObservable();
    }

    public get bookmarks$() {
        return this.#state.subject.pipe(
            map((bookmarks) => Object.entries(bookmarks).map(([_, bookmark]) => bookmark))
        );
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
        this.#state.dispatch.getAll(isValid);
    }

    // Convert to state ??
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

    private addStateEffects() {
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

    dispose() {
        this.#subscriptions.unsubscribe();
    }

    private addSubjectFlows() {
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
        this.#subscriptions.add(
            this.#state.subject.addFlow(handleGetAllOnSuccessCreateUpdateDelete())
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
