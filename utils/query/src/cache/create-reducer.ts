import { castDraft } from 'immer';

import { createReducer } from '@equinor/fusion-observable';

import type { CacheSortFn, QueryCacheRecord, QueryCacheStateData } from './types';

import { ActionBuilder, Actions } from './actions';

const sortCache: CacheSortFn = (a: QueryCacheRecord, b: QueryCacheRecord): number => {
    return (b.updated ?? 0) - (a.updated ?? 0);
};

export default function <TType, TArgs>(
    actions: ActionBuilder<TType, TArgs>,
    initial: QueryCacheStateData<TType, TArgs> = {}
) {
    return createReducer<QueryCacheStateData<TType, TArgs>, Actions<TType, TArgs>>(
        initial,
        (builder) =>
            builder
                .addCase(actions.set, (state, action) => {
                    const { key, entry } = action.payload;

                    const record = state[key];
                    if (!record) {
                        state[key] = castDraft({ ...entry, created: Date.now() });
                    } else {
                        record.updated = Date.now();
                        record.updates ??= 0;
                        record.updates++;
                    }
                })
                .addCase(actions.remove, (state, action) => {
                    delete state[action.payload];
                })
                .addCase(actions.invalidate, (state, action) => {
                    const entry = state[action.payload];
                    if (entry) {
                        delete entry.updated;
                    }
                })
                .addCase(actions.trim, (state, action) => {
                    const { payload } = action;
                    const sortFn: CacheSortFn = payload.sort ?? sortCache;
                    const currentKeys = Object.keys(state);
                    const validKeys = Object.entries(state)
                        /** remove entries which are no longer valid */
                        .filter(
                            ([_, value]) =>
                                !payload.validate ||
                                payload.validate(value as QueryCacheRecord<TType, TArgs>)
                        )
                        /** sort data records */
                        .sort((a, b) => sortFn(a[1], b[1]))
                        /** remove buffer overflow */
                        .slice(0, payload.size ?? Number.MAX_SAFE_INTEGER)
                        /** minimize to only keys */
                        .map(([key]) => key);

                    if (currentKeys.length !== validKeys.length) {
                        for (const key of currentKeys) {
                            /** get index of valid key */
                            const validKey = validKeys.indexOf(key);
                            if (validKey !== -1) {
                                /** valid, no need to keep in search */
                                validKeys.splice(validKey, 1);
                            } else {
                                /** invalid, remove from state */
                                delete state[key];
                            }
                        }
                    }
                })
    );
}
