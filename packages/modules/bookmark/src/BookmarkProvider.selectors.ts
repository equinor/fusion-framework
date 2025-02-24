import type { BookmarkFlowError } from './BookmarkProvider.error';
import type { BookmarkState } from './BookmarkProvider.store';
import type { Bookmark, BookmarkData } from './types';

/**
 * Selects all bookmarks from the application state.
 */
export const bookmarksSelector = (state: BookmarkState): Bookmark[] => {
  return Object.values(state.bookmarks) as Bookmark[];
};

/**
 * Retrieves a bookmark from the state by its ID.
 */
export const bookmarkSelector = <T extends BookmarkData>(
  state: BookmarkState,
  id: string,
): Bookmark<T> | undefined => {
  return state.bookmarks[id] as Bookmark<T>;
};

/**
 * Selects the active bookmark from the bookmark state.
 *
 * if there is an active bookmark, the function returns the bookmark data.
 *
 * if there is no active bookmark, the function returns null.
 * if the active bookmark was never set, the function returns undefined.
 */
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
export const statusSelector = (state: BookmarkState): BookmarkState['status'] => {
  return state.status;
};

/**
 * Selects and returns an array of bookmark flow errors from the state.
 *
 * @param state - The bookmark state.
 * @returns An array of bookmark flow errors.
 */
export const errorsSelector = (state: BookmarkState): Array<BookmarkFlowError> => {
  return Object.values(state.errors);
};
