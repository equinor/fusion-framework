import type { Reducer } from '../..';
import type { QueryCacheActionTypes } from './actions';
import type { QueryCacheState } from './types';

export const createReducer =
    <TType, TArgs>(): Reducer<QueryCacheState<TType, TArgs>, QueryCacheActionTypes<TType, TArgs>> =>
    (state, action) => {
        const { type, payload } = action;
        switch (type) {
            case 'set': {
                const { key, value } = payload;
                const previous = state.data[key];
                const entry = { ...previous, ...value, updates: (previous?.updates ?? 0) + 1 };
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
                        [key]: { ...entry, created: undefined, updates: 0 },
                    };
                    return { ...state, data };
                }
                break;
            }

            case 'reset': {
                const data = payload.data ?? {};
                return { data } as QueryCacheState<TType, TArgs>;
            }
        }
        return state;
    };

export default createReducer;
