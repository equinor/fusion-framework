import { createAction, createAsyncAction, type ActionTypes } from '@equinor/fusion-observable';

import type { Bookmark, BookmarkData, BookmarkWithData, NewBookmark, PatchBookmark } from './types';

import { type BookmarksFilter } from './BookmarkClient.interface';
import { type BookmarkFlowError } from './BookmarkProvider.error';

/**
 * Represents the metadata associated with a bookmark action.
 */
type BookmarkActionMeta = {
    // A reference identifier for the request.
    ref: string;
};

/**
 * Actions related to the BookmarkProvider provider state.
 *
 * Exports a set of actions that can be used to manage bookmarks.
 */
export const bookmarkActions = {
    clearActiveBookmark: createAction('clear_active_bookmark'),
    setActiveBookmark: createAsyncAction(
        'set_active_bookmark',
        (bookmarkId: string, meta?: BookmarkActionMeta) => ({
            payload: bookmarkId,
            meta: { ref: bookmarkId, ...meta },
        }),
        (data: BookmarkData, meta: BookmarkActionMeta) => ({
            payload: data,
            meta,
        }),
        (error: BookmarkFlowError, meta: BookmarkActionMeta) => ({
            payload: error,
            meta,
        }),
    ),
    fetchBookmark: createAsyncAction(
        'fetch_bookmark',
        (bookmarkId: string, meta?: BookmarkActionMeta) => ({
            payload: bookmarkId,
            meta: { ref: bookmarkId, ...meta },
        }),
        (bookmark: Bookmark, meta: BookmarkActionMeta) => ({ payload: bookmark, meta }),
        (error: BookmarkFlowError, meta: BookmarkActionMeta) => ({ payload: error, meta }),
    ),
    fetchBookmarks: createAsyncAction(
        'fetch_bookmarks',
        (filter?: BookmarksFilter, meta?: BookmarkActionMeta) => ({ payload: filter, meta }),
        (bookmarks: Bookmark[], meta?: BookmarkActionMeta) => ({ payload: bookmarks, meta }),
        (error: BookmarkFlowError, meta?: BookmarkActionMeta) => ({ payload: error, meta }),
    ),
    updateBookmark: createAsyncAction(
        'update_bookmark',
        (payload: PatchBookmark, meta: BookmarkActionMeta) => ({ payload, meta }),
        (payload: Bookmark, meta: BookmarkActionMeta) => ({ payload, meta }),
        (payload: BookmarkFlowError, meta: BookmarkActionMeta) => ({ payload, meta }),
    ),
    createBookmark: createAsyncAction(
        'create_bookmark',
        <T>(payload: NewBookmark<T>, meta: BookmarkActionMeta) => ({ payload, meta }),
        <T>(payload: BookmarkWithData<T>, meta: BookmarkActionMeta) => ({ payload, meta }),
        (payload: BookmarkFlowError, meta: BookmarkActionMeta) => ({ payload, meta }),
    ),
    deleteBookmark: createAsyncAction(
        'delete_bookmark',
        (bookmarkId: string, meta?: BookmarkActionMeta) => ({
            payload: bookmarkId,
            meta: { ref: bookmarkId, ...meta },
        }),
        (bookmarkId: string, meta?: BookmarkActionMeta) => ({
            payload: bookmarkId,
            meta: { ref: bookmarkId, ...meta },
        }),
        (payload: BookmarkFlowError, meta: BookmarkActionMeta) => ({ payload, meta }),
    ),
    removeBookmark: createAsyncAction(
        'remove_bookmark',
        (bookmarkId: string, meta?: BookmarkActionMeta) => ({
            payload: bookmarkId,
            meta: { ref: bookmarkId, ...meta },
        }),
        (
            payload: {
                type: 'delete_bookmark' | 'remove_favourite_bookmark';
                bookmarkId: string;
            },
            meta: BookmarkActionMeta,
        ) => ({ payload, meta }),
        (payload: BookmarkFlowError, meta: BookmarkActionMeta) => ({
            payload,
            meta,
        }),
    ),
    addBookmarkAsFavourite: createAsyncAction(
        'add_favourite_bookmark',
        (bookmarkId: string, meta?: BookmarkActionMeta) => ({
            payload: bookmarkId,
            meta: { ref: bookmarkId, ...meta },
        }),
        (bookmarkId: string, meta?: BookmarkActionMeta) => ({
            payload: bookmarkId,
            meta: { ref: bookmarkId, ...meta },
        }),
        (error: BookmarkFlowError, meta: BookmarkActionMeta) => ({ payload: error, meta }),
    ),
    removeBookmarkAsFavourite: createAsyncAction(
        'remove_favourite_bookmark',
        (bookmarkId: string, meta?: BookmarkActionMeta) => ({
            payload: bookmarkId,
            meta: { ref: bookmarkId, ...meta },
        }),
        (bookmarkId: string, meta?: BookmarkActionMeta) => ({
            payload: bookmarkId,
            meta: { ref: bookmarkId, ...meta },
        }),
        (error: BookmarkFlowError, meta: BookmarkActionMeta) => ({ payload: error, meta }),
    ),
};

// type ActionBuilder = typeof bookmarkActions;

// type ActionMap = ActionInstanceMap<ActionBuilder>;

export type BookmarkActions = ActionTypes<typeof bookmarkActions>;
