import { BookmarkFlowError } from './BookmarkProvider.error';
import { BookmarkState } from './BookmarkProvider.store';
import { Bookmark, BookmarkData } from './types';

/**
 * Selects all bookmarks from the application state.
 */
export const bookmarksSelector = (state: BookmarkState): Bookmark[] => {
    return Object.values(state.bookmarks);
};

/**
 * Retrieves a bookmark from the state by its ID.
 */
export const bookmarkSelector = (state: BookmarkState, id: string): Bookmark | undefined => {
    return state.bookmarks[id];
};

/**
 * Selects the active bookmark from the bookmark state.
 *
 * if there is an active bookmark, the function returns the bookmark data.
 *
 * if there is no active bookmark, the function returns null.
 * if the active bookmark was never set, the function returns undefined.
 */
export const activeBookmarkSelector = (state: BookmarkState): BookmarkData | null => {
    const selectedBookmark = state.activeBookmark;
    return selectedBookmark || null;
};

export const errorsSelector = (state: BookmarkState): Array<BookmarkFlowError> => {
    return Object.values(state.errors);
};
