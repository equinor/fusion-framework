import { IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import { BookmarkClientConfig } from './client/bookmarkClient';
import { Bookmark, SourceSystem, BookmarksApiClient, PatchBookmark } from './types';
import { Query } from '@equinor/fusion-query';
import { BehaviorSubject, Observable, Subscription, from, lastValueFrom, map, tap } from 'rxjs';
import { FlowState, createState } from '@equinor/fusion-observable';
import { State, reducer } from './client/bookmarkReducer';
import { ActionBuilder, actions } from './client/bookmarkActions';

export class BookmarkProvider {
    #queryBookmarkById: Query<Bookmark<unknown>, string>;
    #queryAllBookmarks: Query<Array<Bookmark<unknown>>, void>;
    #bookmarkApiClient: BookmarksApiClient;

    #currentBookmark$: BehaviorSubject<Bookmark<unknown> | undefined> = new BehaviorSubject<
        Bookmark<unknown> | undefined
    >(undefined);

    #sourceSystem?: SourceSystem;
    #event?: IEventModuleProvider;

    #state: FlowState<State, ActionBuilder>;
    #subscriptions = new Subscription();

    constructor(
        config: BookmarkClientConfig,
        sourseSystem?: SourceSystem,
        event?: IEventModuleProvider,
    ) {
        const expire: number = 5 * 60 * 1000; // 5 minutes

        this.#bookmarkApiClient = config.client;
        this.#queryBookmarkById = new Query({
            client: {
                fn: config.client.getById, // @TODO: replace with this.#bookmarkApiClient.getById?
            },
            key: (id: string) => id,
            expire,
        });
        this.#queryAllBookmarks = new Query({
            client: {
                fn: config.client.getAll, // @TODO: replace with this.#bookmarkApiClient.getAll?
            },
            key: () => 'all-bookmarks',
            expire,
        });

        this.#sourceSystem = sourseSystem;
        this.#event = event;

        this.#state = createState(actions, reducer);

        // // Add Bookmark API calls as flows
        // this.#addSubjectFlows();

        // // Add Events to actions success
        // this.#addStateEffects();

        // if (event) {
        //     this.#subscriptions.add(
        //         this.#currentBookmark$.subscribe((bookmark) => {
        //             event.dispatchEvent('onBookmarkChanged', {
        //                 detail: bookmark,
        //                 canBubble: true,
        //                 source: this,
        //             });
        //         }),
        //     );
        // }
    }

    public getBookmarkById<T>(bookmarkId: string): Observable<Bookmark<T>> {
        return this.#queryBookmarkById
            .query(bookmarkId)
            .pipe(map((result) => result.value as Bookmark<T>));
    }

    public async getBookmarkByIdAsync<T>(bookmarkId: string): Promise<Bookmark<T>> {
        return lastValueFrom(this.getBookmarkById(bookmarkId));
    }

    public getAllBookmarks(): Observable<Array<Bookmark>> {
        return this.#queryAllBookmarks.query().pipe(map((result) => result.value));
    }

    public getAllBookmarksAsync(): Promise<Array<Bookmark>> {
        return lastValueFrom(this.getAllBookmarks());
    }

    public updateBookmark<T>(bookmark: PatchBookmark) {
        from(this.#bookmarkApiClient.update(bookmark)).pipe(
            // @TODO: remove _
            tap((_bookmark) => {
                // this.#queryBookmarkById.mutate
                // this.#queryAllBookmarks.mutate
            }),
        );
    }
}
