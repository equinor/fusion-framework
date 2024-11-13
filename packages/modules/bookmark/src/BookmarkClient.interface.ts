import { type ObservableInput } from 'rxjs';
import type { Bookmark, BookmarkData, BookmarkWithoutData } from './types';

/**
 * Defines the shape of a filter for querying bookmarks.
 * @property {string} [appKey] - The app key to filter bookmarks by.
 * @property {string} [contextId] - The context ID to filter bookmarks by.
 * @property {object} [sourceSystem] - The source system to filter bookmarks by.
 * @property {string} [sourceSystem.identifier] - The identifier of the source system.
 * @property {string} [sourceSystem.name] - The name of the source system.
 * @property {string} [sourceSystem.subSystem] - The sub-system of the source system.
 */
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
 * Defines the shape of an update to an existing bookmark.
 * @template T - The type of the payload data for the bookmark.
 * @property {string} [name] - The updated name of the bookmark.
 * @property {string} [description] - The updated description of the bookmark.
 * @property {boolean} [isShared] - Whether the bookmark is shared or not.
 * @property {T} [payload] - The updated payload data for the bookmark.
 */
export type BookmarkUpdate<T extends BookmarkData = BookmarkData> = {
    name?: string;
    description?: string;
    isShared?: boolean;
    payload?: T | null;
    sourceSystem?: {
        identifier: string;
        name?: string | null;
        subSystem?: string | null;
    } | null;
};

/**
 * Defines the shape of a new bookmark to be created.
 * @template T - The type of the payload data for the bookmark.
 * @property {string} name - The name of the bookmark.
 * @property {string} appKey - The app key associated with the bookmark.
 * @property {string} [description] - The description of the bookmark.
 * @property {boolean} [isShared] - Whether the bookmark is shared or not.
 * @property {string} [contextId] - The context ID associated with the bookmark.
 * @property {object} [sourceSystem] - Information about the source system of the bookmark.
 * @property {string} [sourceSystem.identifier] - The identifier of the source system.
 * @property {string} [sourceSystem.name] - The name of the source system.
 * @property {string} [sourceSystem.subSystem] - The sub-system of the source system.
 * @property {T} [payload] - The payload data for the bookmark.
 */
export type BookmarkNew<T extends BookmarkData = BookmarkData> = {
    name: string;
    appKey: string;
    description?: string;
    isShared?: boolean;
    contextId?: string;
    sourceSystem?: {
        identifier: string;
        name?: string;
        subSystem?: string;
    };
    payload?: T;
};

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
    getBookmarkById: (bookmarkId: string) => ObservableInput<BookmarkWithoutData>;

    /**
     * Retrieves the bookmark data for the specified bookmark ID.
     *
     * @param bookmarkId - The ID of the bookmark to retrieve data for.
     * @returns An observable that emits the bookmark data.
     */
    getBookmarkData: <T extends BookmarkData>(bookmarkId: string) => ObservableInput<T>;

    /**
     * Updates the data associated with a bookmark.
     *
     * @template T - The type of the data to be associated with the bookmark. Can be a record or null.
     * @param bookmarkId - The ID of the bookmark to update.
     * @param data - The new data to be associated with the bookmark.
     * @returns An observable that emits the updated data.
     */
    setBookmarkData<T extends BookmarkData | null>(bookmarkId: string, data: T): ObservableInput<T>;

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
    createBookmark: <T extends BookmarkData>(
        bookmark: BookmarkNew<T>,
    ) => ObservableInput<Bookmark<T>>;

    /**
     * Updates an existing bookmark.
     * @template TPayload - The type of the payload data for the bookmark.
     * @param bookmark - The bookmark data to update.
     * @returns An observable input containing the updated bookmark.
     */
    updateBookmark: <T extends BookmarkData>(
        bookmarkId: string,
        updates: BookmarkUpdate<T>,
    ) => ObservableInput<Bookmark<T>>;

    /**
     * Deletes a bookmark by id.
     * @param bookmarkId - The id of the bookmark to delete.
     * @returns An observable input containing a boolean indicating whether the operation was successful.
     */
    deleteBookmark: (bookmarkId: string) => ObservableInput<boolean>;
}
