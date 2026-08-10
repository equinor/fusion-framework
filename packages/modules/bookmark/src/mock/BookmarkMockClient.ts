import { of, throwError, type ObservableInput } from 'rxjs';
import { v4 as generateGUID } from 'uuid';

import type {
  BookmarkNew,
  BookmarksFilter,
  BookmarkUpdate,
  IBookmarkClient,
} from '../BookmarkClient.interface';
import type { Bookmark, BookmarkData, BookmarkUser, BookmarkWithoutData } from '../types';

/** Attributed to every bookmark the mock client creates or updates. */
const mockUser: BookmarkUser = { id: 'mock-user', name: 'Mock User' };

/**
 * Strips the `payload` field from a bookmark, mirroring what the real
 * `BookmarkClient` does before returning a {@link BookmarkWithoutData}.
 *
 * @param bookmark - The bookmark to strip.
 * @returns The bookmark without its payload.
 */
const stripPayload = (bookmark: Bookmark): BookmarkWithoutData => {
  const { payload: _payload, ...rest } = bookmark;
  return rest;
};

/**
 * Checks whether a seeded bookmark matches the given {@link BookmarksFilter}.
 *
 * @remarks
 * Only `appKey` and `contextId` are checked, mirroring the two fields the real
 * `BookmarkProvider` actually resolves and passes through as a filter.
 *
 * @param bookmark - The seeded bookmark to test.
 * @param filter - The filter to match against, if any.
 * @returns `true` when the bookmark satisfies every constraint in `filter`.
 */
const matchesFilter = (bookmark: Bookmark, filter?: BookmarksFilter): boolean => {
  // no filter means every seeded bookmark matches
  if (!filter) return true;
  // an appKey constraint excludes bookmarks attributed to a different app
  if (filter.appKey && bookmark.appKey !== filter.appKey) return false;
  // a contextId constraint excludes bookmarks attributed to a different context
  if (filter.contextId && bookmark.context?.id !== filter.contextId) return false;
  return true;
};

/**
 * Runs `fn` synchronously and reports the outcome as an {@link ObservableInput},
 * so a mock method can `throw` for a "not found" case exactly like the async
 * real client would reject.
 *
 * @template T - The value `fn` produces.
 * @param fn - The synchronous operation to run.
 * @returns An observable emitting `fn`'s result, or erroring with what it threw.
 */
const resultOf = <T>(fn: () => T): ObservableInput<T> => {
  try {
    return of(fn());
  } catch (error) {
    return throwError(() => error);
  }
};

/**
 * In-memory {@link IBookmarkClient} backed by a `Map` of seeded bookmarks and a
 * `Set` of favorite ids.
 *
 * @remarks
 * Used by {@link BookmarkMockConfigurator} to swap out the real API client
 * while leaving `BookmarkProvider` and the `bookmark-flows/` epics running
 * unmodified — every create, update, delete, and favorite call still goes
 * through the real flow logic, only the underlying data source is in-memory.
 */
export class BookmarkMockClient implements IBookmarkClient {
  #bookmarks = new Map<string, Bookmark>();
  #favorites = new Set<string>();

  /**
   * Replaces the seeded bookmarks with the given collection, keyed by `id`.
   *
   * @param items - The bookmarks to seed. Replaces any previously seeded bookmarks.
   */
  public setBookmarks(items: Iterable<Bookmark>): void {
    this.#bookmarks = new Map(Array.from(items, (item) => [item.id, item]));
  }

  /**
   * Marks a seeded bookmark as a favorite, or clears it.
   *
   * @param bookmarkId - The id of the bookmark to update.
   * @param isFavorite - `true` to favorite the bookmark, `false` to clear it.
   */
  public setFavorite(bookmarkId: string, isFavorite: boolean): void {
    // track favorites as a set membership rather than a boolean field on the bookmark
    if (isFavorite) {
      this.#favorites.add(bookmarkId);
    } else {
      this.#favorites.delete(bookmarkId);
    }
  }

  /**
   * Looks up a seeded bookmark by id without going through the `ObservableInput` API.
   *
   * @param bookmarkId - The id of the bookmark to look up.
   * @returns The seeded bookmark, or `undefined` when no bookmark was seeded for that id.
   */
  public getBookmark(bookmarkId: string): Bookmark | undefined {
    return this.#bookmarks.get(bookmarkId);
  }

  /**
   * Looks up a seeded bookmark by id, throwing when none was seeded.
   *
   * @param bookmarkId - The id of the bookmark to look up.
   * @returns The seeded bookmark.
   * @throws {Error} When no bookmark was seeded for `bookmarkId`.
   */
  #requireBookmark(bookmarkId: string): Bookmark {
    const bookmark = this.#bookmarks.get(bookmarkId);
    // fail loudly so a missing seed reads as a test setup bug, not a silent no-op
    if (!bookmark) {
      throw new Error(`BookmarkMockClient: no bookmark seeded for id '${bookmarkId}'`);
    }
    return bookmark;
  }

  /**
   * Returns every seeded bookmark that matches `filter`.
   *
   * @param filter - Optional constraints to narrow the returned bookmarks.
   * @returns The matching bookmarks.
   */
  public getAllBookmarks(filter?: BookmarksFilter): ObservableInput<Array<Bookmark>> {
    return resultOf(() =>
      // only appKey/contextId are checked, mirroring what BookmarkProvider resolves
      Array.from(this.#bookmarks.values()).filter((bookmark) => matchesFilter(bookmark, filter)),
    );
  }

  /**
   * Returns a seeded bookmark by id, without its payload.
   *
   * @param bookmarkId - The id of the bookmark to look up.
   * @returns The bookmark without its payload.
   * @throws {Error} When no bookmark was seeded for `bookmarkId`.
   */
  public getBookmarkById(bookmarkId: string): ObservableInput<BookmarkWithoutData> {
    return resultOf(() => stripPayload(this.#requireBookmark(bookmarkId)));
  }

  /**
   * Returns the payload data of a seeded bookmark.
   *
   * @template T - The shape of the bookmark's payload.
   * @param bookmarkId - The id of the bookmark to look up.
   * @returns The bookmark's payload.
   * @throws {Error} When no bookmark was seeded for `bookmarkId`.
   */
  public getBookmarkData<T extends BookmarkData>(bookmarkId: string): ObservableInput<T> {
    return resultOf(() => this.#requireBookmark(bookmarkId).payload as T);
  }

  /**
   * Replaces the payload data of a seeded bookmark.
   *
   * @template T - The shape of the bookmark's payload.
   * @param bookmarkId - The id of the bookmark to update.
   * @param data - The new payload data.
   * @returns The payload that was set.
   * @throws {Error} When no bookmark was seeded for `bookmarkId`.
   */
  public setBookmarkData<T extends BookmarkData | null>(
    bookmarkId: string,
    data: T,
  ): ObservableInput<T> {
    return resultOf(() => {
      const existing = this.#requireBookmark(bookmarkId);
      this.#bookmarks.set(bookmarkId, { ...existing, payload: data ?? undefined });
      return data;
    });
  }

  /**
   * Marks a seeded bookmark as a favorite.
   *
   * @param bookmarkId - The id of the bookmark to favorite.
   * @returns `true` once the bookmark is marked as a favorite.
   * @throws {Error} When no bookmark was seeded for `bookmarkId`.
   */
  public addBookmarkToFavorites(bookmarkId: string): ObservableInput<boolean> {
    return resultOf(() => {
      this.#requireBookmark(bookmarkId);
      this.#favorites.add(bookmarkId);
      return true;
    });
  }

  /**
   * Clears a seeded bookmark's favorite status.
   *
   * @param bookmarkId - The id of the bookmark to unfavorite.
   * @returns `true` once the bookmark is no longer a favorite.
   */
  public removeBookmarkFromFavorites(bookmarkId: string): ObservableInput<boolean> {
    return resultOf(() => {
      this.#favorites.delete(bookmarkId);
      return true;
    });
  }

  /**
   * Checks whether a seeded bookmark is currently a favorite.
   *
   * @param bookmarkId - The id of the bookmark to check.
   * @returns `true` when the bookmark is a favorite.
   */
  public isBookmarkFavorite(bookmarkId: string): ObservableInput<boolean> {
    return of(this.#favorites.has(bookmarkId));
  }

  /**
   * Seeds a new bookmark from create input, generating its id and audit fields.
   *
   * @template T - The shape of the bookmark's payload.
   * @param bookmark - The data to create the bookmark from.
   * @returns The created bookmark.
   */
  public createBookmark<T extends BookmarkData>(
    bookmark: BookmarkNew<T>,
  ): ObservableInput<Bookmark<T>> {
    return resultOf(() => {
      // `contextId` is a plain id on the client input, but a `{ id }` object on the bookmark itself
      const { contextId, ...rest } = bookmark;
      // merge the create input with generated audit fields and a normalized context
      const created: Bookmark<T> = {
        ...rest,
        id: generateGUID(),
        created: new Date(),
        createdBy: mockUser,
        ...(contextId ? { context: { id: contextId } } : {}),
      };
      this.#bookmarks.set(created.id, created);
      return created;
    });
  }

  /**
   * Applies updates to a seeded bookmark, stamping new audit fields.
   *
   * @template T - The shape of the bookmark's payload.
   * @param bookmarkId - The id of the bookmark to update.
   * @param updates - The fields to update.
   * @returns The updated bookmark.
   * @throws {Error} When no bookmark was seeded for `bookmarkId`.
   */
  public updateBookmark<T extends BookmarkData>(
    bookmarkId: string,
    updates: BookmarkUpdate<T>,
  ): ObservableInput<Bookmark<T>> {
    return resultOf(() => {
      const existing = this.#requireBookmark(bookmarkId);
      // merge the updates onto the existing bookmark, then stamp new audit fields
      const updated: Bookmark<T> = {
        ...existing,
        ...updates,
        updated: new Date(),
        updatedBy: mockUser,
      } as Bookmark<T>;
      this.#bookmarks.set(bookmarkId, updated);
      return updated;
    });
  }

  /**
   * Removes a seeded bookmark and clears its favorite status.
   *
   * @param bookmarkId - The id of the bookmark to delete.
   * @returns `true` when a bookmark was seeded for `bookmarkId` and was removed.
   */
  public deleteBookmark(bookmarkId: string): ObservableInput<boolean> {
    return resultOf(() => {
      const existed = this.#bookmarks.delete(bookmarkId);
      this.#favorites.delete(bookmarkId);
      return existed;
    });
  }
}
