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

import { BehaviorSubject, lastValueFrom, map, Observable, Subscription } from 'rxjs';

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

        if (event) {
            this.#subscriptions.add(
                this.#currentBookmark$.subscribe((bookmark) => {
                    event.dispatchEvent('onBookmarkChanged', {
                        detail: bookmark,
                        canBubble: true,
                        source: this,
                    });
                })
            );
        }
    }

    public get currentBookmark$(): Observable<Bookmark | undefined> {
        return this.#currentBookmark$.asObservable();
    }

    public get bookmarks$(): Observable<Bookmark[]> {
        return this.#state.subject.pipe(
            map((state) => Object.values(state.bookmarks).map((bookmark) => bookmark))
        );
    }

    public async setCurrentBookmark<T>(idOrItem?: string | Bookmark<T>): Promise<void> {
        if (!idOrItem) {
            return this.#currentBookmark$.next(undefined);
        }

        if (typeof idOrItem === 'string') {
            // TODO add custom error
            const bookmark = await this.resolverBookmarkAsync<T>(idOrItem);
            return this.setBookmark(bookmark);
            // TODO do a deep fast equal, since propagated bookmarks can be of different instances
        } else if (idOrItem !== this.#currentBookmark$.value) {
            return this.setBookmark(idOrItem);
        }
    }

    public async setBookmark<T>(bookmark?: Bookmark<T>): Promise<void> {
        if (this.#event) {
            /** notify that current bookmark is about to change */
            const event = await this.#event.dispatchEvent('onBookmarkChange', {
                detail: bookmark,
                cancelable: true,
                canBubble: true,
                source: this,
            });

            /** check if any listeners requested canceling */
            if (!event.canceled) {
                this.#currentBookmark$.next(bookmark);
            }
        } else {
            this.#currentBookmark$.next(bookmark);
        }
    }

    public resolverBookmark<T>(bookmarkId: string): Observable<Bookmark<T>> {
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

    public resolverBookmarkAsync<T>(bookmarkId: string): Promise<Bookmark<T>> {
        return lastValueFrom(this.resolverBookmark<T>(bookmarkId));
    }

    public getAllBookmarks(args = { isValid: false }): Observable<Array<Bookmark>> {
        const { isValid } = args;
        return new Observable((subscriber) => {
            this.#state.dispatch.getAll(isValid);
            subscriber.add(
                this.#state.subject.addEffect('getAll::success', (action) => {
                    subscriber.next(action.payload);
                    subscriber.complete();
                })
            );
        });
    }

    public async getAllBookmarksAsync(args = { isValid: false }): Promise<Array<Bookmark>> {
        return lastValueFrom(this.getAllBookmarks(args));
    }

    public async getBookmarkById<T>(bookmarkId: string): Promise<Bookmark<T>> {
        const result = await this.#bookmarkAPiClient.get('v1', { id: bookmarkId });
        const bookmark = (await result.json()) as Bookmark<T>;
        return bookmark;
    }

    public createBookmark(bookmark: CreateBookmark<unknown>): Observable<Bookmark<unknown>> {
        return new Observable((subscriber) => {
            this.#state.dispatch.create(bookmark);
            subscriber.add(
                this.#state.subject.addEffect('create::success', (action) => {
                    subscriber.next(action.payload as Bookmark<unknown>);
                    subscriber.complete();
                })
            );
            subscriber.add(
                this.#state.subject.addEffect('create::failure', (action) => {
                    subscriber.error(action.payload);
                })
            );
        });
    }

    public async createBookmarkAsync(
        bookmark: CreateBookmark<unknown>
    ): Promise<Bookmark<unknown>> {
        return lastValueFrom(this.createBookmark(bookmark));
    }

    public updateBookmark<T>(bookmark: Bookmark<T>): Observable<Bookmark<T>> {
        return new Observable((subscriber) => {
            this.#state.dispatch.update(bookmark);
            subscriber.add(
                this.#state.subject.addEffect('update::success', (action) => {
                    subscriber.next(action.payload as Bookmark<T>);
                    subscriber.complete();
                    this.#queryBookmarkById.cache.invalidate(action.payload.id);
                })
            );
        });
    }

    public async updateBookmarkAsync<T>(bookmark: Bookmark<T>): Promise<Bookmark<T>> {
        return lastValueFrom(this.updateBookmark(bookmark));
    }

    public deleteBookmarkById(bookmarkId: string): Observable<string> {
        return new Observable((subscriber) => {
            this.#state.dispatch.delete(bookmarkId);
            subscriber.add(
                this.#state.subject.addEffect('delete::success', (action) => {
                    subscriber.next(action.payload);
                    subscriber.complete();
                    this.#queryBookmarkById.cache.invalidate(action.payload);
                })
            );
        });
    }

    public async deleteBookmarkByIdAsync(bookmarkId: string): Promise<string> {
        return lastValueFrom(this.deleteBookmarkById(bookmarkId));
    }

    dispose(): void {
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
