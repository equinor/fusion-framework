import {
    Action,
    createAction,
    createAsyncAction,
    type ActionTypes,
} from '@equinor/fusion-observable';

import type { Bookmark, BookmarkData, BookmarkWithoutData, Bookmarks } from './types';

import { BookmarkNew, BookmarkUpdate, type BookmarksFilter } from './BookmarkClient.interface';
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
    aborted: createAction('action_aborted', (action: Action) => ({
        payload: action,
    })),
    setBookmark: createAction('update_bookmark', (bookmark: BookmarkWithoutData) => {
        return { payload: bookmark };
    }),
    setCurrentBookmark: createAction('set_current_bookmark', (bookmark: Bookmark | null) => {
        return { payload: bookmark };
    }),
    fetchBookmark: createAsyncAction(
        'fetch_bookmark',
        (bookmarkId: string, meta?: BookmarkActionMeta) => ({
            payload: bookmarkId,
            meta,
        }),
        (bookmark: BookmarkWithoutData, meta?: BookmarkActionMeta) => ({ payload: bookmark, meta }),
        (error: BookmarkFlowError, meta?: BookmarkActionMeta) => ({ payload: error, meta }),
    ),
    fetchBookmarkData: createAsyncAction(
        'fetch_bookmark_payload',
        (bookmarkId: string, meta?: BookmarkActionMeta) => ({ payload: bookmarkId, meta }),
        (bookmarkId: string, data: BookmarkData, meta?: BookmarkActionMeta) => ({
            payload: { bookmarkId, data },
            meta,
        }),
        (error: BookmarkFlowError, meta?: BookmarkActionMeta) => ({ payload: error, meta }),
    ),
    fetchBookmarks: createAsyncAction(
        'fetch_bookmarks',
        (filter?: BookmarksFilter, meta?: BookmarkActionMeta) => ({ payload: filter, meta }),
        (bookmarks: Bookmarks, meta?: BookmarkActionMeta) => ({ payload: bookmarks, meta }),
        (error: BookmarkFlowError, meta?: BookmarkActionMeta) => ({ payload: error, meta }),
    ),
    updateBookmark: createAsyncAction(
        'update_bookmark',
        (payload: { bookmarkId: string; updates: BookmarkUpdate }, meta: BookmarkActionMeta) => ({
            payload,
            meta,
        }),
        (payload: Bookmark, meta: BookmarkActionMeta) => ({ payload, meta }),
        (payload: BookmarkFlowError, meta: BookmarkActionMeta) => ({ payload, meta }),
    ),
    createBookmark: createAsyncAction(
        'create_bookmark',
        (payload: BookmarkNew, meta: BookmarkActionMeta) => ({ payload, meta }),
        (payload: Bookmark, meta: BookmarkActionMeta) => ({ payload, meta }),
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

export type BookmarkActions = ActionTypes<typeof bookmarkActions>;
