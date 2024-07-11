import { from, type ObservableInput } from 'rxjs';
import { map, tap } from 'rxjs/operators';

/**
 * Imports the `Query` type from the `@equinor/fusion-query` package.
 * This type is used to cache the results of API requests.
 */
import { Query } from '@equinor/fusion-query';

/**
 * Imports the `BookmarksApiClient` and `ApiBookmarkEntityV1` types from the `@equinor/fusion-framework-module-services/bookmarks` package.
 * These types are used to interact with the Fusion Bookmarks API and represent the API response entities.
 */
import type { BookmarksApiClient } from '@equinor/fusion-framework-module-services/bookmarks';

import type {
    IBookmarkClient,
    BookmarksFilter,
    BookmarkNew,
    BookmarkUpdate,
} from './BookmarkClient.interface';

import type { Bookmark, BookmarkData, BookmarkWithoutData, Bookmarks } from './types';
import { bookmarkSchema, bookmarkWithDataSchema, bookmarksSchema } from './bookmark.schemas';

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
 */
export class BookmarkClient implements IBookmarkClient {
    #api: BookmarksApiClient<'json$'>;

    #queryBookmark: Query<BookmarkWithoutData, { bookmarkId: string }>;
    #queryBookmarks: Query<Bookmarks, BookmarksFilter | undefined>;
    #queryBookmarkData: Query<BookmarkData, { bookmarkId: string }>;

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
                    this.#api.get('v1', args).pipe(map((res) => bookmarkSchema.parse(res))),
            },
            key: (args) => args.bookmarkId,
            expire,
        });

        // set up the query for fetching all bookmarks
        this.#queryBookmarks = new Query({
            client: {
                fn: (filter?: BookmarksFilter) =>
                    this.#api
                        .query('v1', { filter })
                        .pipe(map((res) => bookmarksSchema.parse(res))),
            },
            key: (args) => JSON.stringify(args),
            expire,
        });

        this.#queryBookmarkData = new Query({
            client: {
                fn: (args: { bookmarkId: string }) =>
                    this.#api.getPayload('v1', args).pipe(map((res) => res.payload ?? {})),
            },
            key: (args) => args.bookmarkId,
            expire,
            cache: {
                trimming: {
                    size: 3,
                },
            },
        });
    }

    public getAllBookmarks(filter?: BookmarksFilter): ObservableInput<Bookmark[]> {
        return this.#queryBookmarks.query(filter).pipe(map((res) => res.value as Bookmark[]));
    }

    public getBookmarkById(bookmarkId: string): ObservableInput<BookmarkWithoutData> {
        return this.#queryBookmark.query({ bookmarkId }).pipe(map((res) => res.value));
    }

    public getBookmarkData<T extends BookmarkData>(bookmarkId: string): ObservableInput<T> {
        return this.#queryBookmarkData
            .query({ bookmarkId })
            .pipe(map((res): T => res.value.payload as T));
    }

    public setBookmarkData<T extends BookmarkData | null>(
        bookmarkId: string,
        data: T,
    ): ObservableInput<T> {
        return this.#api.patch('v1', { bookmarkId, updates: { payload: data } }).pipe(
            map((res) => res.payload as T),
            tap((updatedData) => {
                if (updatedData) {
                    this.#queryBookmarkData.mutate(
                        { bookmarkId },
                        { value: updatedData, updated: Date.now() },
                        { allowCreation: true },
                    );
                }
            }),
        );
    }

    public createBookmark<T extends BookmarkData>(
        newBookmark: BookmarkNew<T>,
    ): ObservableInput<Bookmark<T>> {
        return this.#api.create('v1', newBookmark).pipe(
            map((response) => bookmarkWithDataSchema<T>().parse(response) as Bookmark<T>),
            /** update the bookmark cache */
            tap((createdBookmark) => {
                const { payload, ...bookmark } = createdBookmark;
                this.#queryBookmark.mutate(
                    { bookmarkId: bookmark.id },
                    { value: bookmark, updated: Date.now() },
                    { allowCreation: true },
                );
                if (payload) {
                    this.#queryBookmarkData.mutate(
                        { bookmarkId: bookmark.id },
                        { value: payload, updated: Date.now() },
                        { allowCreation: true },
                    );
                }
                this.#queryBookmarks.invalidate();
            }),
        );
    }

    public updateBookmark<T extends Record<string, unknown>>(
        bookmarkId: string,
        updates: BookmarkUpdate<T>,
    ): ObservableInput<Bookmark<T>> {
        return this.#api.patch('v1', { bookmarkId, updates: updates }).pipe(
            map((response) => bookmarkWithDataSchema().parse(response) as Bookmark<T>),
            /** Update the query cache for the specific bookmark */
            tap((updatedBookmark) => {
                const { payload, ...bookmark } = updatedBookmark;
                payload;
                this.#queryBookmark.mutate(
                    { bookmarkId },
                    { value: bookmark, updated: Date.now() },
                    { allowCreation: false },
                );
            }),
            /** update the cache for bookmark data */
            tap((createdBookmark) => {
                const { payload } = createdBookmark;
                if (payload) {
                    this.#queryBookmarkData.mutate(
                        {
                            bookmarkId: createdBookmark.id,
                        },
                        { value: payload, updated: Date.now() },
                        { allowCreation: true },
                    );
                } else {
                    const cacheKey = this.#queryBookmarkData.generateCacheKey({
                        bookmarkId: createdBookmark.id,
                    });
                    this.#queryBookmarkData.cache.removeItem(cacheKey);
                }
            }),
            tap(() => {
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
