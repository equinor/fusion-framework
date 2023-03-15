import { createAsyncAction, ActionInstanceMap, ActionTypes } from '@equinor/fusion-observable';

import { Bookmark, CreateBookmark } from '../types';

export const actions = {
    getAll: createAsyncAction(
        'getAll',
        (isValid: boolean) => ({ payload: isValid }),
        (bookmarks: Bookmark[]) => ({ payload: bookmarks }),
        (err: unknown) => ({ payload: err })
    ),
    delete: createAsyncAction(
        'delete',
        (id: string) => ({ payload: id }),
        (id: string) => ({ payload: id })
    ),
    update: createAsyncAction(
        'update',
        (bookmark: Bookmark) => ({ payload: bookmark }),
        (bookmark: Bookmark) => ({ payload: bookmark })
    ),
    create: createAsyncAction(
        'create',
        (bookmark: CreateBookmark) => ({ payload: bookmark }),
        (bookmark: Bookmark) => ({ payload: bookmark }),
        (err: unknown) => ({ payload: err })
    ),
};

export type ActionBuilder = typeof actions;

export type ActionMap = ActionInstanceMap<ActionBuilder>;

export type Actions = ActionTypes<typeof actions>;
