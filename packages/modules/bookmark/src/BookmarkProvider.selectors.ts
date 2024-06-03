import { BookmarkState } from './BookmarkProvider.reducer';
import { Bookmark } from './types';

export const bookmarksSelector = (state: BookmarkState): Record<string, Bookmark> =>
    state.bookmarks;

export const bookmarkSelector = (state: BookmarkState, id: string): Bookmark | undefined =>
    bookmarksSelector(state)[id];

export const selectedBookmarkSelector = (state: BookmarkState): Bookmark | undefined | null => {
    const selectedBookmarkId = state.selectedBookmark;
    if (typeof selectedBookmarkId === 'string') {
        return bookmarkSelector(state, selectedBookmarkId);
    }
    return selectedBookmarkId;
};
