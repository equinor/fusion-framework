import type { BookmarkFlowError } from './BookmarkFlowError';
import type { BookmarkState } from './create-bookmark-store';
import type { Bookmark, BookmarkData } from './types';

/**
 * Selects all bookmarks from the store state as an array.
 *
 * @param state - The current bookmark store state.
 * @returns An array of all bookmarks.
 */
export const bookmarksSelector = (state: BookmarkState): Bookmark[] => {
  return Object.values(state.bookmarks) as Bookmark[];
};

/**
 * Retrieves a single bookmark from the store state by its ID.
 *
 * @template T - The bookmark payload data shape.
 * @param state - The current bookmark store state.
 * @param id - The bookmark identifier to look up.
 * @returns The matching bookmark, or `undefined` if not found.
 */
// tightly coupled group of store selectors
// fusion-lint-disable-next-line single-export-per-file
export const bookmarkSelector = <T extends BookmarkData>(
  state: BookmarkState,
  id: string,
): Bookmark<T> | undefined => {
  return state.bookmarks[id] as Bookmark<T>;
};

/**
 * Selects the currently active bookmark from the store state.
 *
 * @template T - The bookmark payload data shape.
 * @param state - The current bookmark store state.
 * @returns The active bookmark, `null` if explicitly cleared, or `undefined` if never set.
 */
// tightly coupled group of store selectors
// fusion-lint-disable-next-line single-export-per-file
export const activeBookmarkSelector = <T extends BookmarkData>(
  state: BookmarkState,
): Bookmark<T> | null | undefined => {
  return state.currentBookmark as Bookmark<T> | null | undefined;
};

/**
 * Selects the status from the bookmark state.
 *
 * @param state - The bookmark state.
 * @returns The status from the bookmark state.
 */
// tightly coupled group of store selectors
// fusion-lint-disable-next-line single-export-per-file
export const statusSelector = (state: BookmarkState): BookmarkState['status'] => {
  return state.status;
};

/**
 * Selects and returns an array of bookmark flow errors from the state.
 *
 * @param state - The bookmark state.
 * @returns An array of bookmark flow errors.
 */
// tightly coupled group of store selectors
// fusion-lint-disable-next-line single-export-per-file
export const errorsSelector = (state: BookmarkState): Array<BookmarkFlowError> => {
  return Object.values(state.errors);
};
