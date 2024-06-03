import { createAsyncAction, type ActionTypes } from '@equinor/fusion-observable';

import type { Bookmark, BookmarkData, NewBookmark, PatchBookmark } from './types';

import { type BookmarksFilter } from './BookmarkClient.interface';
import { type BookmarkFlowError } from './BookmarkProvider.error';

/**
 * Actions related to the BookmarkProvider provider state.
 *
 * Exports a set of actions that can be used to manage bookmarks.
 */
export const bookmarkActions = {
    setActiveBookmark: createAsyncAction(
        'set_active_bookmark',
        (bookmarkId: string | null) => ({
            payload: bookmarkId,
        }),
        (data: BookmarkData | null) => ({ payload: data }),
        (error: BookmarkFlowError) => ({ payload: error }),
    ),
    fetchBookmark: createAsyncAction(
        'fetch_bookmark',
        (bookmarkId: string) => ({ payload: bookmarkId }),
        (bookmark: Bookmark) => ({ payload: bookmark }),
        (error: BookmarkFlowError) => ({ payload: error }),
    ),
    fetchBookmarks: createAsyncAction(
        'fetch_bookmarks',
        (filter?: BookmarksFilter) => ({ payload: filter }),
        (bookmarks: Bookmark[]) => ({ payload: bookmarks }),
        (error: BookmarkFlowError) => ({ payload: error }),
    ),
    updateBookmark: createAsyncAction(
        'update_bookmark',
        (bookmark: PatchBookmark) => ({ payload: bookmark }),
        (bookmark: Bookmark) => ({ payload: bookmark }),
        (error: BookmarkFlowError) => ({ payload: error }),
    ),
    createBookmark: createAsyncAction(
        'create_bookmark',
        (bookmark: NewBookmark) => ({ payload: bookmark }),
        (bookmark: Bookmark) => ({ payload: bookmark }),
        (error: BookmarkFlowError) => ({ payload: error }),
    ),
    deleteBookmark: createAsyncAction(
        'delete_bookmark',
        (bookmarkID: string) => ({ payload: bookmarkID }),
        (bookmarkID: string) => ({ payload: bookmarkID }),
        (error: BookmarkFlowError) => ({ payload: error }),
    ),
    removeBookmark: createAsyncAction(
        'remove_bookmark',
        (bookmarkID: string) => ({ payload: bookmarkID }),
        (payload: {
            type: 'delete_bookmark' | 'remove_bookmark_favorite';
            bookmarkID: string;
        }) => ({ payload }),
        (payload: BookmarkFlowError) => ({
            payload,
        }),
    ),
    addBookmarkAsFavorite: createAsyncAction(
        'add_bookmark',
        (bookmarkID: string) => ({ payload: bookmarkID }),
        (bookmarkID: string) => ({ payload: bookmarkID }),
        (error: BookmarkFlowError) => ({ payload: error }),
    ),
    removeBookmarkAsFavorite: createAsyncAction(
        'remove_bookmark_favorite',
        (bookmarkID: string) => ({ payload: bookmarkID }),
        (bookmarkID: string) => ({ payload: bookmarkID }),
        (error: BookmarkFlowError) => ({ payload: error }),
    ),
};

// type ActionBuilder = typeof bookmarkActions;

// type ActionMap = ActionInstanceMap<ActionBuilder>;

export type BookmarkActions = ActionTypes<typeof bookmarkActions>;
