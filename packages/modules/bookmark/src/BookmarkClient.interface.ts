import { type ObservableInput } from 'rxjs';
import type { Bookmark, BookmarkData, BookmarkWithData, NewBookmark, PatchBookmark } from './types';

export type BookmarksFilter = {
    appKey?: string;
    contextId?: string;
    sourceSystem?: {
        identifier?: string;
        name?: string;
        subSystem?: string;
    };
};

/**
 * Represents a partial update for a bookmark, including the bookmark ID and optional updates to the name, description, sharing status, and associated data.
 * @template T - The type of the bookmark data.
 */
export type BookmarkUpdate<T = unknown> = Pick<Bookmark, 'id'> &
    Partial<Pick<BookmarkWithData<T>, 'name' | 'description' | 'isShared' | 'data'>>;

/**
 * Defines the interface for a Bookmarks client, which provides methods for managing bookmarks.
 */
export interface IBookmarkClient {
    /**
     * Retrieves all bookmarks for the current user.
     * @template TPayload - The type of the payload data for the bookmarks.
     * @param args - Optional arguments to filter or customize the bookmark retrieval.
     * @returns An observable input containing an array of bookmarks.
     */
    getAllBookmarks: (filter?: BookmarksFilter) => ObservableInput<Array<Bookmark>>;

    /**
     * Retrieves a single bookmark by id.
     * @template TPayload - The type of the payload data for the bookmark.
     * @param bookmarkId - The id of the bookmark to retrieve.
     * @returns An observable input containing the requested bookmark.
     */
    getBookmarkById: <TPayload = unknown, TExpand extends boolean = false>(
        bookmarkId: string,
        includeData?: TExpand,
    ) => TExpand extends true
        ? ObservableInput<BookmarkWithData<TPayload>>
        : ObservableInput<Bookmark>;

    /**
     * Retrieves the bookmark data for the specified bookmark ID.
     *
     * @param bookmarkId - The ID of the bookmark to retrieve data for.
     * @returns An observable that emits the bookmark data.
     */
    getBookmarkData: <TPayload = unknown>(
        bookmarkId: string,
    ) => ObservableInput<BookmarkData<TPayload>>;

    /**
     * Adds a bookmark to the current user's favorites.
     * @param bookmarkId - The id of the bookmark to add to favorites.
     * @returns An observable input containing a boolean indicating whether the operation was successful.
     */
    addBookmarkToFavorites: (bookmarkId: string) => ObservableInput<boolean>;

    /**
     * Removes a bookmark from the current user's favorites.
     * @param bookmarkId - The id of the bookmark to remove from favorites.
     * @returns An observable input containing a boolean indicating whether the operation was successful.
     */
    removeBookmarkFromFavorites: (bookmarkId: string) => ObservableInput<boolean>;

    /**
     * Verifies whether a bookmark is a favorite of the current user.
     * @param bookmarkId - The id of the bookmark to verify.
     * @returns An observable input containing a boolean indicating whether the bookmark is a favorite.
     */
    isBookmarkFavorite: (bookmarkId: string) => ObservableInput<boolean>;

    /**
     * Creates a new bookmark.
     * @template TPayload - The type of the payload data for the bookmark.
     * @param bookmark - The bookmark data to create.
     * @returns An observable input containing the created bookmark.
     */
    createBookmark: <TPayload = unknown>(
        bookmark: NewBookmark<TPayload>,
    ) => ObservableInput<BookmarkWithData<TPayload>>;

    /**
     * Updates an existing bookmark.
     * @template TPayload - The type of the payload data for the bookmark.
     * @param bookmark - The bookmark data to update.
     * @returns An observable input containing the updated bookmark.
     */
    updateBookmark: <TPayload = unknown>(
        bookmark: PatchBookmark<TPayload>,
    ) => ObservableInput<BookmarkWithData<TPayload>>;

    /**
     * Deletes a bookmark by id.
     * @param bookmarkId - The id of the bookmark to delete.
     * @returns An observable input containing a boolean indicating whether the operation was successful.
     */
    deleteBookmark: (bookmarkId: string) => ObservableInput<boolean>;
}
