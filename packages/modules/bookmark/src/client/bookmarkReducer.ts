import { createReducer } from '@equinor/fusion-observable';
import { Bookmark } from '../types';
import { actions } from './bookmarkActions';

export const reducer = createReducer<Record<string, Bookmark>>({}, (builder) => {
    builder.addCase(actions.create.success, (state, { payload }) => {
        state[payload.id] = payload;
    });

    builder.addCase(actions.getAll.success, (state, { payload }) => {
        payload.forEach((bookmark) => {
            state[bookmark.id] = bookmark;
        });
    });

    builder.addCase(actions.delete.success, (state, { payload }) => {
        delete state[payload];
    });

    builder.addCase(actions.update.success, (state, { payload }) => {
        state[payload.id] = payload;
    });
});
