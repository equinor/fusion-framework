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
    ApiBookmark_V1,
} from '@equinor/fusion-framework-module-services/bookmarks';

import type { IBookmarkClient, BookmarksFilter } from './BookmarkClient.interface';

import type { Bookmark, BookmarkData, BookmarkWithData, NewBookmark } from './types';
/**
 * Normalizes an API bookmark entity into a `Bookmark` object.
 *
 * @template TPayload - The payload type of the bookmark.
 * @param res - The API bookmark entity to normalize.
 * @returns The normalized `Bookmark` object.
 */
const normalizeBookmark = (res: ApiBookmark_V1): Bookmark =>
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

    #queryBookmark: Query<Bookmark, { id: string }>;
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
                fn: (args: { id: string }) =>
                    this.#api.get('v1', args).pipe(map(normalizeBookmark)),
            },
            key: (args) => args.id,
            expire,
        });

        // set up the query for fetching all bookmarks
        this.#queryBookmarks = new Query({
            client: {
                fn: (filter?: BookmarksFilter) =>
                    this.#api
                        .getAll('v1', { filter })
                        .pipe(map((res) => res.result.map(normalizeBookmark))),
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
        const query$ = this.#queryBookmark.query({ id: bookmarkId }).pipe(map((res) => res.value));
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
        return this.#api.getPayload('v1', { id: bookmarkId }).pipe(
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
        return this.#api.post('v1', bookmark).pipe(
            map(normalizeBookmark),
            map((res) => ({ ...res, data: bookmark.payload }) as BookmarkWithData<T>),
        );
    }

    public updateBookmark<T = unknown>(
        bookmark: Pick<Bookmark, 'id'> &
            Partial<Pick<Bookmark, 'name' | 'description' | 'isShared' | 'sourceSystem'>> & {
                payload?: T;
            },
    ): ObservableInput<Bookmark> {
        return this.#api.patch('v1', bookmark).pipe(
            map((updatedBookmark) => normalizeBookmark(updatedBookmark as ApiBookmark_V1)),
            tap((updatedBookmark) => {
                this.#queryBookmark.mutate(
                    { id: updatedBookmark.id },
                    { value: updatedBookmark, updated: Date.now() },
                );
                this.#queryBookmarks.invalidate();
            }),
        );
    }

    public deleteBookmark(id: string): ObservableInput<boolean> {
        return this.#api.delete(
            'v1',
            { id },
            {
                selector: async (response) => {
                    if (!response.ok) {
                        throw new Error('Failed to delete bookmark');
                    }
                    return response.ok;
                },
            },
        );
    }

    public addBookmarkToFavorites(bookmarkId: string): ObservableInput<boolean> {
        return this.#api
            .addFavorite(
                'v1',
                { bookmarkId },
                {
                    selector: async (response) => {
                        if (!response.ok) {
                            throw new Error('Failed to add favorite');
                        }
                        return response.ok;
                    },
                },
            )
            .pipe(tap(() => this.#queryBookmarks.invalidate()));
    }

    public removeBookmarkFromFavorites(bookmarkId: string): ObservableInput<boolean> {
        return this.#api
            .removeFavorite(
                'v1',
                { bookmarkId },
                {
                    selector: async (response) => {
                        if (!response.ok) {
                            throw new Error('Failed to remove favorite');
                        }
                        return response.ok;
                    },
                },
            )
            .pipe(tap(() => this.#queryBookmarks.invalidate()));
    }

    public isBookmarkFavorite(bookmarkId: string): ObservableInput<boolean> {
        return this.#api.verifyFavorite(
            'v1',
            { bookmarkId },
            {
                selector: async (response) => {
                    if (!response.ok) {
                        throw new Error('Failed to verify favorite');
                    }
                    return response.ok;
                },
            },
        );
    }
}
