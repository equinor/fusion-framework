import {
    FrameworkEvent,
    FrameworkEventInit,
    IEventModuleProvider,
} from '@equinor/fusion-framework-module-event';

import { createState, FlowState } from '@equinor/fusion-observable';
import Query from '@equinor/fusion-query';

import { BehaviorSubject, from, lastValueFrom, map, Observable, ObservableInput, Subscription } from 'rxjs';

import {
    Bookmark,
    BookmarksApiClient,
    CreateBookmark,
    PatchBookmark,
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
    client: BookmarksApiClient;
};

export class BookmarkClient {
    #queryBookmarkById: Query<Bookmark<unknown>, string>;
    #queryAllBookmarks: Query<Array<Bookmark<unknown>>, void>;
    #bookmarkAPiClient: BookmarksApiClient;

    #currentBookmark$: BehaviorSubject<Bookmark<unknown> | undefined>;

    #sourceSystem?: SourceSystem;
    #event?: IEventModuleProvider;

    #state: FlowState<State, ActionBuilder>;
    #subscriptions = new Subscription();

    appRoute?(appKey: string): string;

    constructor(
        config: BookmarkClientConfig,
        sourceSystem?: SourceSystem,
        event?: IEventModuleProvider,
    ) {
        this.#currentBookmark$ = new BehaviorSubject<Bookmark<unknown> | undefined>(undefined);

        const expire: number = 5 * 60 * 1000;
        this.#bookmarkAPiClient = config.client;
        this.#queryBookmarkById = new Query({
            client: {
                fn: config.client.getById,
            },
            key: (id: string) => id,
            expire,
        });
        this.#queryAllBookmarks = new Query({
            client: {
                fn: config.client.getAll,
            },
            key: () => 'all-bookmarks',
            expire,
        });

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
                }),
            );
        }
    }

    public get currentBookmark$(): Observable<Bookmark | undefined> {
        return this.#currentBookmark$.asObservable();
    }

    public get bookmarks$(): Observable<Bookmark[]> {
        return this.#state.subject.pipe(
            map((state) => Object.values(state.bookmarks).map((bookmark) => bookmark)),
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

    public getAllBookmarks(args = { isValid: false }): Observable<Array<Bookmark>> {
        const { isValid } = args;
        return new Observable((subscriber) => {
            this.#state.dispatch.getAll(isValid);
            subscriber.add(
                this.#state.subject.addEffect('getAll::success', (action) => {
                    subscriber.next(action.payload);
                    subscriber.complete();

                    this.#event?.dispatchEvent('onBookmarksChanged', {
                        detail: action.payload,
                        source: this,
                    });
                }),
            );
        });
    }

    public async getAllBookmarksAsync(args = { isValid: false }): Promise<Array<Bookmark>> {
        return lastValueFrom(this.getAllBookmarks(args));
    }

    public getBookmarkById<T>(bookmarkId: string): Observable<Bookmark<T>> {
        return this.#queryBookmarkById
            .query(bookmarkId)
            .pipe(map((result) => result.value as Bookmark<T>));
    }

    public async getBookmarkByIdAsync<T>(bookmarkId: string): Promise<Bookmark<T>> {
        return lastValueFrom(this.getBookmarkById(bookmarkId));
    }

    public createBookmark(bookmark: CreateBookmark<unknown>): Observable<Bookmark<unknown>> {
        return new Observable((subscriber) => {
            this.#state.dispatch.create(bookmark);
            subscriber.add(
                this.#state.subject.addEffect('create::success', (action) => {
                    this.#queryAllBookmarks.cache.invalidate();
                    subscriber.next(action.payload as Bookmark<unknown>);
                    subscriber.complete();
                }),
            );
            subscriber.add(
                this.#state.subject.addEffect('create::failure', (action) => {
                    subscriber.error(action.payload);
                }),
            );
        });
    }

    public async createBookmarkAsync(
        bookmark: CreateBookmark<unknown>,
    ): Promise<Bookmark<unknown>> {
        return lastValueFrom(this.createBookmark(bookmark));
    }

    public updateBookmark<T>(bookmark: PatchBookmark<T>): Observable<Bookmark<T>> {
        return new Observable((subscriber) => {
            this.#state.dispatch.update(bookmark);
            subscriber.add(
                this.#state.subject.addEffect('update::success', (action) => {
                    subscriber.next(action.payload as Bookmark<T>);
                    subscriber.complete();
                    this.#queryBookmarkById.cache.invalidate(action.payload.id);
                    this.#queryAllBookmarks.cache.invalidate();
                }),
            );
            subscriber.add(
                this.#state.subject.addEffect('update::failure', (action) => {
                    subscriber.error(action.payload);
                }),
            );
        });
    }

    public async updateBookmarkAsync<T>(bookmark: PatchBookmark<T>): Promise<Bookmark<T>> {
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
                }),
            );
            subscriber.add(
                this.#state.subject.addEffect('delete::failure', (action) => {
                    subscriber.error(action.payload);
                }),
            );
        });
    }

    public async deleteBookmarkByIdAsync(bookmarkId: string): Promise<string> {
        return lastValueFrom(this.deleteBookmarkById(bookmarkId));
    }

    public async addBookmarkFavoriteAsync(bookmarkId: string): Promise<void> {
        const response = await this.#bookmarkAPiClient.addFavorite('v1', { bookmarkId });
        if (response.ok && this.#currentBookmark$.value) {
            this.#state.dispatch.addFavorite(this.#currentBookmark$.value);
        }
    }

    public async removeBookmarkFavoriteAsync(bookmarkId: string): Promise<void> {
        const response = await this.#bookmarkAPiClient.removeFavorite('v1', { bookmarkId });
        if (response.ok) {
            this.#state.dispatch.removeFavorite(bookmarkId);
        }
    }

    public async verifyBookmarkFavoriteAsync(bookmarkId: string): Promise<boolean> {
        const response = await this.#bookmarkAPiClient.verifyFavorite('v1', { bookmarkId });
        if (response.ok) return true;
        return false;
    }

    dispose(): void {
        this.#subscriptions.unsubscribe();
    }

    #addStateEffects() {
        this.#state.subject.addEffect('create::success', (action) => {
            this.#queryAllBookmarks.cache.invalidate();
            this.#event?.dispatchEvent('onBookmarkCreated', {
                detail: action.payload,
                canBubble: true,
                source: this,
            });
        });
        this.#state.subject.addEffect('delete::success', (action) => {
            this.#queryAllBookmarks.cache.invalidate();
            this.#queryBookmarkById.cache.removeItem(action.payload);
            this.#event?.dispatchEvent('onBookmarkDeleted', {
                detail: action.payload,
                canBubble: true,
                source: this,
            });
        });
        this.#state.subject.addEffect('update::success', (action) => {
            this.#queryAllBookmarks.cache.invalidate();
            this.#queryBookmarkById.cache.invalidate(action.payload.id);
            this.#event?.dispatchEvent('onBookmarkUpdated', {
                detail: action.payload,
                canBubble: true,
                source: this,
            });
        });
        this.#state.subject.addEffect('addFavorite::request', () => {
            this.#queryAllBookmarks.cache.invalidate();
        });

        this.#state.subject.addEffect('removeFavorite::request', () => {
            this.#queryAllBookmarks.cache.invalidate();
        });
    }

    #addSubjectFlows() {
        this.#subscriptions.add(
            this.#state.subject.addFlow(
                handleBookmarkGetAll(this.#queryAllBookmarks, this.#sourceSystem?.identifier),
            ),
        );
        this.#subscriptions.add(
            this.#state.subject.addFlow(handleCreateBookmark(this.#bookmarkAPiClient)),
        );
        this.#subscriptions.add(
            this.#state.subject.addFlow(handleDeleteBookmark(this.#bookmarkAPiClient)),
        );
        this.#subscriptions.add(
            this.#state.subject.addFlow(handleUpdateBookmark(this.#bookmarkAPiClient)),
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
