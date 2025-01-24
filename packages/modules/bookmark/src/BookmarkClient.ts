import { Observable, type ObservableInput } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

/**
 * Imports the `Query` type from the `@equinor/fusion-query` package.
 * This type is used to cache the results of API requests.
 */
import { Query } from '@equinor/fusion-query';

/**
 * Imports the `BookmarksApiClient` and `ApiBookmarkEntityV1` types from the `@equinor/fusion-framework-module-services/bookmarks` package.
 * These types are used to interact with the Fusion Bookmarks API and represent the API response entities.
 */
import {
    type BookmarksApiClient,
    ApiBookmarkSchema,
    ApiPersonSchema,
    ApiVersion,
} from '@equinor/fusion-framework-module-services/bookmarks';

import type {
    IBookmarkClient,
    BookmarksFilter,
    BookmarkNew,
    BookmarkUpdate,
} from './BookmarkClient.interface';

import type { Bookmark, BookmarkData, BookmarkWithoutData, Bookmarks, BookmarkUser } from './types';
import { bookmarkWithDataSchema } from './bookmark.schemas';
import { z } from 'zod';

// Define the schema for the API response entity representing a bookmark
const UserSchema = ApiPersonSchema['1.0'].transform((person) => {
    return {
        // @deprecated
        azureUniqueId: person.azureUniqueId,
        id: person.azureUniqueId,
        name: person.name,
        email: person.mail,
    } as BookmarkUser;
});

// Parse the bookmark entity from the API response
const parseBookmark = <T extends BookmarkData>(value: unknown): Bookmark<T> => {
    const { createdBy, updatedBy, ...rest } = value as z.infer<
        (typeof ApiBookmarkSchema)[ApiVersion.v2]
    >;
    return bookmarkWithDataSchema().parse({
        ...rest,
        createdBy: UserSchema.parse(createdBy),
        updatedBy: updatedBy ? UserSchema.parse(updatedBy) : undefined,
    }) as Bookmark<T>;
};

const parseBookmarkWithoutPayload = (value: unknown): BookmarkWithoutData => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { payload, ...bookmark } = parseBookmark(value);
    return bookmark;
};

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
    #queryBookmarkData: Query<BookmarkData | undefined, { bookmarkId: string }>;

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
                fn: (args: { bookmarkId: string }) => {
                    return this.#api.get('v2', args).pipe(map(parseBookmarkWithoutPayload));
                },
            },
            key: (args) => args.bookmarkId,
            expire,
        });

        // set up the query for fetching all bookmarks
        this.#queryBookmarks = new Query({
            client: {
                fn: (filter?: BookmarksFilter) => {
                    return this.#api
                        .query('v2', { filter })
                        .pipe(map((res) => res.map(parseBookmarkWithoutPayload)));
                },
            },
            key: (args) => JSON.stringify(args ?? ''),
            expire,
        });

        this.#queryBookmarkData = new Query({
            client: {
                fn: (args: { bookmarkId: string }) => {
                    return this.#api.getPayload('v1', args).pipe(map((res) => res.payload));
                },
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
        return this.#queryBookmarkData.query({ bookmarkId }).pipe(map((res): T => res.value as T));
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
            map((response) => parseBookmark<T>(response)),
            /** update the bookmark cache */
            tap((createdBookmark) => {
                console.log('createdBookmark', createdBookmark);
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

    public updateBookmark<T extends BookmarkData>(
        bookmarkId: string,
        updates: BookmarkUpdate<T>,
    ): ObservableInput<Bookmark<T>> {
        const update$ = this.#api.patch('v1', { bookmarkId, updates: updates }).pipe(
            map((response) => parseBookmark<T>(response)),
            shareReplay(),
        );
        return new Observable((subscriber) => {
            // update the query cache for the specific bookmark
            subscriber.add(
                update$.subscribe((updatedBookmark) => {
                    const { payload, ...bookmark } = updatedBookmark;
                    // payload should not be included in the bookmark object
                    payload;
                    this.#queryBookmark.mutate(
                        { bookmarkId },
                        { value: bookmark, updated: Date.now() },
                        { allowCreation: false },
                    );
                }),
            );

            // update the cache for bookmark data
            subscriber.add(
                update$.subscribe((updatedBookmark) => {
                    const { payload } = updatedBookmark;
                    if (payload) {
                        this.#queryBookmarkData.mutate(
                            {
                                bookmarkId: updatedBookmark.id,
                            },
                            { value: payload, updated: Date.now() },
                            { allowCreation: true },
                        );
                    } else {
                        const cacheKey = this.#queryBookmarkData.generateCacheKey({
                            bookmarkId: updatedBookmark.id,
                        });
                        this.#queryBookmarkData.cache.removeItem(cacheKey);
                    }
                }),
            );

            // invalidate the bookmarks query cache
            subscriber.add(
                update$.subscribe(() => {
                    this.#queryBookmarks.invalidate();
                }),
            );

            // emit the update to the subscriber
            update$.subscribe(subscriber);
        });
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
