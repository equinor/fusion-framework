import type { Reducer } from '../..';
import type { QueryCacheActionTypes } from './actions';
import type { QueryCacheRecord, QueryCacheState, QueryCacheStateData } from './types';

const sortCache = (a: QueryCacheRecord, b: QueryCacheRecord): number => {
    return (b.updated ?? 0) - (a.updated ?? 0);
};

export const createReducer =
    <TType, TArgs>(): Reducer<QueryCacheState<TType, TArgs>, QueryCacheActionTypes<TType, TArgs>> =>
    (state, action) => {
        const { type, payload } = action;
        switch (type) {
            case 'set': {
                const { key, value } = payload;
                const previous = state.data[key];
                const entry = {
                    ...previous,
                    ...value,
                    created: previous?.created ?? Date.now(),
                    updated: Date.now(),
                    updates: (previous?.updates ?? -1) + 1,
                };
                const data = { ...state.data, [key]: entry };
                return { ...state, data, lastTransaction: entry.transaction };
            }

            case 'clear': {
                const data = { ...state.data };
                delete data[payload.key];
                /** might need to check last transaction */
                return { ...state, data };
            }

            case 'invalidate': {
                const { key } = payload;
                const entry = state.data[key];
                if (entry) {
                    const data = {
                        ...state.data,
                        [key]: { ...entry, updated: undefined },
                    };
                    return { ...state, data };
                }
                break;
            }

            case 'reset': {
                const data = payload.data ?? {};
                return { data } as QueryCacheState<TType, TArgs>;
            }

            case 'trim': {
                const sortFn = payload.sort ?? sortCache;
                const sortedData = Object.entries(state.data).sort((a, b) => sortFn(a[1], b[1]));
                const data = sortedData
                    .filter(([_, value]) => !payload.validate || payload.validate(value))
                    .slice(0, payload.size ?? Number.MAX_SAFE_INTEGER)
                    .reduce(
                        (acc, [key, value]) => Object.assign(acc, { [key]: value }),
                        {} as QueryCacheStateData<TType, TArgs>
                    );
                /** assume the state is the same since it contains the same amount of records as before */
                if (Object.keys(data).length === Object.keys(state.data).length) {
                    return state;
                }

                /** not likely, but the last transaction might been removed */
                const lastTransaction =
                    state.lastTransaction && Object.keys(data).includes(state.lastTransaction)
                        ? state.lastTransaction
                        : Object.values(data)[0].transaction;

                return { lastTransaction, data };
            }
        }
        return state;
    };

export default createReducer;
