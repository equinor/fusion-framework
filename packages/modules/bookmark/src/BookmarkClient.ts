import { from, type ObservableInput } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

/**
 * Imports the `Query` type from the `@equinor/fusion-query` package.
 * This type is used to cache the results of API requests.
 */
import { Query } from '@equinor/fusion-query';

/**
 * Imports the `BookmarksApiClient` and `ApiBookmarkEntityV1` types from the `@equinor/fusion-framework-module-services/bookmarks` package.
 * These types are used to interact with the Fusion Bookmarks API and represent the API response entities.
 */
import type {
    BookmarksApiClient,
    ApiBookmark,
} from '@equinor/fusion-framework-module-services/bookmarks';

import type { IBookmarkClient, BookmarksFilter } from './BookmarkClient.interface';

import type { Bookmark, BookmarkData, BookmarkWithData, NewBookmark, PatchBookmark } from './types';
/**
 * Normalizes an API bookmark entity into a `Bookmark` object.
 *
 * @template TPayload - The payload type of the bookmark.
 * @param res - The API bookmark entity to normalize.
 * @returns The normalized `Bookmark` object.
 */
const normalizeBookmark = (res: ApiBookmark<'v1'>): Bookmark =>
    ({
        appKey: res.appKey,
        id: res.id,
        name: res.name,
        sourceSystem: res.sourceSystem,
        created: res.created,
        createdBy: res.createdBy,
        description: res.description,
        isShared: res.isShared,
        updated: res.updated,
        updatedBy: res.updatedBy,
        context: res.context,
    }) satisfies Bookmark;

/**
 * Represents a client for interacting with the Fusion Bookmarks API.
 * This class provides methods for retrieving, creating, updating, and deleting bookmarks, as well as managing favorites.
 *
 * This implementation consumes the `@equinor/fusion-framework-module-services/bookmarks` package.
 * This is the default implementation of the bookmarks API client.
 *
 * This class is intended to be used by the Fusion framework with the Fusion Core Services (Backend)
 *
 * Fetching single and all bookmarks will use Query from '@equinor/fusion-query' to cache the results.
 *
 * @note if you wish to implement your own bookmarks API client, you can do so by implementing the {@link IBookmarkClient} interface.
 *
 * @example
 * import { BookmarkClient } from '@equinor/fusion-bookmark';
 * import { BookmarksApiClient } from '@equinor/fusion-framework-module-services/bookmarks';
 * import { HttpClient } from '@equinor/fusion-framework-module-http/client';
 *
 * const httpClient = new HttpClient('https://my-fusion-backend-url.com');
 * const apiClient = new BookmarksApiClient(httpClient, 'json$');
 * const client = new BookmarkClient(apiClient);
 *
 * client.getAllBookmarks().subscribe(bookmarks => {
 *     // do something with bookmarks
 * });
 *
 * client.getBookmarkById('bookmark-id').subscribe(bookmark => {
 * // do something with bookmark
 * });
 */
export class BookmarkClient implements IBookmarkClient {
    #api: BookmarksApiClient<'json$'>;

    #queryBookmark: Query<Bookmark, { bookmarkId: string }>;
    #queryBookmarks: Query<Array<Bookmark>, BookmarksFilter | undefined>;

    /**
     * Constructs a new `BookmarkClient` instance with the provided `BookmarksApiClient`.
     *
     * @param api - The `BookmarksApiClient` instance to use for making API requests.
     */
    constructor(api: BookmarksApiClient<'json$'>, options?: { expire?: number }) {
        this.#api = api;

        const { expire = 5 * 60 * 1000 } = options ?? {};

        // set up the query for fetching a single bookmark
        this.#queryBookmark = new Query({
            client: {
                fn: (args: { bookmarkId: string }) =>
                    this.#api.get('v1', args).pipe(map(normalizeBookmark)),
            },
            key: (args) => args.bookmarkId,
            expire,
        });

        // set up the query for fetching all bookmarks
        this.#queryBookmarks = new Query({
            client: {
                fn: (filter?: BookmarksFilter) =>
                    this.#api
                        .getAll('v1', { filter })
                        .pipe(map((res) => res.map(normalizeBookmark))),
            },
            key: (args) => JSON.stringify(args),
            expire,
        });
    }

    public getAllBookmarks(filter?: BookmarksFilter): ObservableInput<Bookmark[]> {
        return this.#queryBookmarks.query(filter).pipe(map((res) => res.value as Bookmark[]));
    }

    public getBookmarkById<TPayload = unknown, TExpand extends boolean = false>(
        bookmarkId: string,
        includeData?: TExpand,
    ): TExpand extends true
        ? ObservableInput<BookmarkWithData<TPayload>>
        : ObservableInput<Bookmark> {
        const query$ = this.#queryBookmark.query({ bookmarkId }).pipe(map((res) => res.value));
        return includeData
            ? query$.pipe(
                  withLatestFrom(from(this.getBookmarkData<TPayload>(bookmarkId))),
                  map(([bookmark, { data }]) => ({ ...bookmark, data })),
              )
            : query$;
    }

    public getBookmarkData<TPayload = unknown>(
        bookmarkId: string,
    ): ObservableInput<BookmarkData<TPayload>> {
        return this.#api.getPayload('v1', { bookmarkId }).pipe(
            map((res) => {
                const { id, context, payload } = res;
                let data: TPayload | Error | undefined;
                if (payload) {
                    try {
                        data = JSON.parse(payload) as TPayload;
                    } catch (e) {
                        data = e as Error;
                    }
                }
                return { id, context, data };
            }),
        );
    }

    public createBookmark<T>(bookmark: NewBookmark<T>): ObservableInput<BookmarkWithData<T>> {
        // convert the data to a string and remove the data property from the bookmark
        const { data, ...rest } = bookmark;
        const payload = data ? JSON.stringify(data) : undefined;
        return this.#api.create('v1', { ...rest, payload: JSON.stringify(payload) }).pipe(
            map(normalizeBookmark),
            // add the bookmark to the cache
            tap((updatedBookmark) => {
                // Update the cache with the new bookmark value and timestamp
                this.#queryBookmark.mutate(
                    { bookmarkId: updatedBookmark.id },
                    { value: updatedBookmark, updated: Date.now() },
                );
                // Invalidate the bookmarks query cache
                this.#queryBookmarks.invalidate();
            }),
            // assume that the payload that we send is the data that we want to store
            map((response) => ({ ...response, data: payload }) as BookmarkWithData<T>),
        );
    }

    public updateBookmark<T = unknown>(bookmark: PatchBookmark<T>): ObservableInput<Bookmark> {
        // convert the data to a string and remove the data property from the bookmark
        const { data, ...rest } = bookmark;
        const payload = data ? JSON.stringify(data) : undefined;

        return this.#api.patch('v1', { ...rest, payload }).pipe(
            // map api response to bookmark
            map((updatedBookmark) => normalizeBookmark(updatedBookmark)),
            // Update the query cache for the specific bookmark
            tap((updatedBookmark) => {
                // Update the cache with the new bookmark value and timestamp
                this.#queryBookmark.mutate(
                    { bookmarkId: updatedBookmark.id },
                    { value: updatedBookmark, updated: Date.now() },
                );
                // Invalidate the bookmarks query cache
                this.#queryBookmarks.invalidate();
            }),
        );
    }

    public deleteBookmark(bookmarkId: string): ObservableInput<boolean> {
        return this.#api.delete('v1', { bookmarkId });
    }

    public addBookmarkToFavorites(bookmarkId: string): ObservableInput<boolean> {
        return this.#api
            .addFavourite('v1', { bookmarkId })
            .pipe(tap(() => this.#queryBookmarks.invalidate()));
    }

    public removeBookmarkFromFavorites(bookmarkId: string): ObservableInput<boolean> {
        return this.#api
            .removeFavourite('v1', { bookmarkId })
            .pipe(tap(() => this.#queryBookmarks.invalidate()));
    }

    public isBookmarkFavorite(bookmarkId: string): ObservableInput<boolean> {
        return this.#api.isFavorite('v1', { bookmarkId });
    }
}
