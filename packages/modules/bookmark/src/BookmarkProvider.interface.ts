/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Observable, ObservableInput } from 'rxjs';
import type { Bookmark, BookmarkData, BookmarkWithoutData } from './types';
import type { BookmarkNew, BookmarkUpdate } from './BookmarkClient.interface';
import type { BookmarkProviderEventMap } from './BookmarkProvider.events';
import type { BookmarkState } from './BookmarkProvider.store';

/**
 * Arguments for creating a bookmark via {@link IBookmarkProvider.createBookmark}.
 *
 * Omits fields that the provider resolves automatically (`appKey`, `contextId`, `sourceSystem`),
 * but allows the caller to override `appKey` if needed.
 *
 * @template T - The type of payload data stored in the bookmark.
 */
export type BookmarkCreateArgs<T extends BookmarkData = any> = Omit<
  BookmarkNew<T>,
  'appKey' | 'contextId' | 'sourceSystem'
> &
  Partial<Pick<BookmarkNew<T>, 'appKey'>>;

/**
 * Options that control how {@link IBookmarkProvider.updateBookmark} processes an update.
 *
 * @property excludePayloadGeneration - When `true`, skip running registered payload generators
 *   and send the update payload as-is. Useful when the caller has already computed the full payload.
 */
export type BookmarkUpdateOptions = {
  excludePayloadGeneration?: boolean;
};

/**
 * Callback registered with {@link IBookmarkProvider.addPayloadGenerator} that participates
 * in building or transforming bookmark payload data during create and update operations.
 *
 * The `payload` argument is an Immer draft — mutate it in place rather than returning a new
 * object. If the generator returns a value it will be used, but this is discouraged.
 * Return `null` to signal that the bookmark payload should be cleared.
 *
 * @template TData - Shape of the bookmark payload.
 * @param payload - The accumulated payload draft from previous generators (mutable).
 * @param initial - The original payload before any generators ran (read-only reference).
 * @returns A partial payload, `void` (when mutating the draft), or `null` to clear.
 */
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

  /**
   * Registers a payload generator that runs during bookmark create and update operations.
   *
   * Multiple generators can be registered and they execute sequentially, each receiving
   * the accumulated payload from previous generators.
   *
   * @template TData - Shape of the bookmark payload.
   * @param generator - The generator callback to register.
   * @returns A disposal function that unregisters the generator when called.
   */
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
