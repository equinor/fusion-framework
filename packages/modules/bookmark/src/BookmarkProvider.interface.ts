/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable, ObservableInput } from 'rxjs';
import type { Bookmark, BookmarkData, BookmarkWithoutData } from './types';
import type { BookmarkNew, BookmarkUpdate } from './BookmarkClient.interface';
import type { BookmarkProviderEventMap } from './BookmarkProvider.events';
import type { BookmarkState } from './BookmarkProvider.store';

export type BookmarkCreateArgs<T extends BookmarkData = any> = Omit<
  BookmarkNew<T>,
  'appKey' | 'contextId' | 'sourceSystem'
> &
  Partial<Pick<BookmarkNew<T>, 'appKey'>>;

export type BookmarkUpdateOptions = {
  excludePayloadGeneration?: boolean;
};

export type BookmarkPayloadGenerator<TData extends BookmarkData = any> = (
  payload?: Partial<TData> | null,
  initial?: Partial<TData> | null,
) => Promise<Partial<TData> | void> | Partial<TData> | void;

/**
 * Interface representing a Bookmark Provider.
 */
export interface IBookmarkProvider {
  readonly currentBookmark: Bookmark | null | undefined;
  /**
   * Observable of the current bookmark.
   *
   * @type {ObservableInput<Bookmark | null | undefined>}
   */
  readonly currentBookmark$: Observable<Bookmark | null | undefined>;

  readonly bookmarks$: Observable<BookmarkWithoutData[]>;

  /**
   * Observable status of the bookmark provider.
   */
  readonly status$: Observable<BookmarkState['status']>;

  /**
   * Indicates whether the user can create bookmarks.
   * If no payload generator is provided, this will always be false.
   *
   * @type {boolean}
   */
  readonly canCreateBookmarks: boolean;

  /**
   * fetch a bookmark by its ID.
   *
   * @param {string} bookmarkId - The ID of the bookmark to fetch.
   * @returns {ObservableInput<Bookmark>} An observable input of the bookmark.
   */
  getBookmark(bookmarkId: string): ObservableInput<Bookmark>;

  /**
   * Fetches all bookmarks.
   *
   * @returns {ObservableInput<Bookmark[]>} An observable input of the bookmarks.
   */
  getAllBookmarks(): ObservableInput<Bookmark[]>;

  /**
   * Sets the current bookmark.
   *
   * @param {Bookmark | string | null} bookmark_or_id - The bookmark or its ID to set as current.
   * @returns {ObservableInput<Bookmark | null>} An observable input of the current bookmark.
   */
  setCurrentBookmark(bookmark_or_id: Bookmark | string | null): ObservableInput<Bookmark | null>;

  /**
   * Creates a new bookmark.
   *
   * @param {BookmarkCreateArgs} newBookmarkData - The data for the new bookmark.
   * @returns {ObservableInput<Bookmark>} An observable input of the created bookmark.
   */
  createBookmark(newBookmarkData: BookmarkCreateArgs): ObservableInput<Bookmark>;

  /**
   * Updates an existing bookmark.
   *
   * @param {string} bookmarkId - The ID of the bookmark to update.
   * @param {BookmarkUpdate} [bookmarkUpdates] - The updates to apply to the bookmark.
   * @param {BookmarkUpdateOptions} [options] - Additional options for the update.
   * @returns {ObservableInput<Bookmark>} An observable input of the updated bookmark.
   */
  updateBookmark(
    bookmarkId: string,
    bookmarkUpdates?: BookmarkUpdate,
    options?: BookmarkUpdateOptions,
  ): ObservableInput<Bookmark>;

  /**
   * Deletes a bookmark.
   *
   * @param {string} bookmarkId - The ID of the bookmark to delete.
   * @returns {ObservableInput<void>} An observable input indicating the deletion.
   */
  deleteBookmark(bookmarkId: string): ObservableInput<void>;

  /**
   * Adds a bookmark to the favorites.
   *
   * @param {string} bookmarkId - The ID of the bookmark to add to favorites.
   * @returns {ObservableInput<void>} An observable input indicating the addition.
   */
  addBookmarkToFavorites(bookmarkId: string): ObservableInput<BookmarkWithoutData | undefined>;

  /**
   * Removes a bookmark from the favorites.
   *
   * @param {string} bookmarkId - The ID of the bookmark to remove from favorites.
   * @returns {ObservableInput<void>} An observable input indicating the removal.
   */
  removeBookmarkAsFavorite(bookmarkId: string): ObservableInput<void>;

  /**
   * Checks if a bookmark is in the favorites.
   *
   * @param bookmarkId
   * @returns {ObservableInput<boolean>} An observable input indicating whether the bookmark is in the favorites.
   */
  isBookmarkInFavorites(bookmarkId: string): ObservableInput<boolean>;

  addPayloadGenerator<TData extends BookmarkData>(
    generator: BookmarkPayloadGenerator<TData>,
  ): VoidFunction;

  /**
   * Registers an event listener for bookmark provider events.
   *
   * @param {TType} eventName - The name of the event to listen for.
   * @param {(event: BookmarkProviderEventMap[TType]) => void} callback - The callback to invoke when the event is triggered.
   * @returns {VoidFunction} A function to unregister the event listener.
   */
  on<TType extends keyof BookmarkProviderEventMap>(
    eventName: TType,
    callback: (event: BookmarkProviderEventMap[TType]) => void,
  ): VoidFunction;
}
