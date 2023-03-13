import { createReducer } from '@equinor/fusion-observable';
import { Bookmark } from '../types';
import { actions } from './bookmarkActions';

export type State = {
    bookmarks: Record<string, Bookmark>;
};

const initialState: State = {
    bookmarks: {},
};

export const reducer = createReducer<State>(initialState, (builder) => {
    builder
        .addCase(actions.create.success, (state, { payload }) => {
            state.bookmarks[payload.id] = payload;
        })
        .addCase(actions.getAll.success, (state, { payload }) => {
            payload.forEach((bookmark) => {
                state.bookmarks[bookmark.id] = bookmark;
            });
        })
        .addCase(actions.delete.success, (state, { payload }) => {
            delete state.bookmarks[payload];
        })
        .addCase(actions.update.success, (state, { payload }) => {
            state.bookmarks[payload.id] = payload;
        });
});
