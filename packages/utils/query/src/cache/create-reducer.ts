import { castDraft } from 'immer';
import { createReducer } from '@equinor/fusion-observable';
import type { CacheSortFn, QueryCacheRecord, QueryCacheStateData } from './types';
import { ActionBuilder, Actions } from './actions';

/**
 * Sort function for ordering cache records based on their update time.
 * @param a First QueryCacheRecord for comparison.
 * @param b Second QueryCacheRecord for comparison.
 * @returns A number indicating the sort order.
 */
const sortCache: CacheSortFn = (a: QueryCacheRecord, b: QueryCacheRecord): number => {
    return (b.updated ?? 0) - (a.updated ?? 0);
};

/**
 * Creates a reducer for managing the state of a query cache.
 * @param actions An object containing action creators for the cache.
 * @param initial The initial state data of the query cache.
 * @returns A reducer function tailored for the query cache state.
 */
export default function <TType, TArgs>(
    actions: ActionBuilder<TType, TArgs>,
    initial: QueryCacheStateData<TType, TArgs> = {},
) {
    return createReducer<QueryCacheStateData<TType, TArgs>, Actions<TType, TArgs>>(
        initial,
        (builder) =>
            builder
                // Handles the 'set' action to update or add a cache record.
                .addCase(actions.set, (state, action) => {
                    const { key, entry } = action.payload;
                    const record = state[key];

                    if (record) {
                        // If the record exists, update the timestamp and increment the update count.
                        record.updated = Date.now();
                        record.updates ??= 0;
                        record.updates++;
                        delete record.mutated;
                    } else {
                        // If the record does not exist, create a new one with the current timestamp.
                        const created = Date.now();
                        state[key] = castDraft({
                            ...entry,
                            created,
                            updated: created, // Set `updated` to the creation time.
                        });
                    }
                })
                // Handles the 'remove' action to delete a cache record.
                .addCase(actions.remove, (state, action) => {
                    delete state[action.payload];
                })
                // Handles the 'invalidate' action to invalidate a cache record.
                .addCase(actions.invalidate, (state, action) => {
                    const invalidKey = action.payload ? [action.payload] : Object.keys(state);
                    for (const key of invalidKey) {
                        const entry = state[key];
                        if (entry) {
                            delete entry.updated;
                        }
                    }
                })
                // Handles the 'mutate' action to modify a cache record's value and metadata.
                .addCase(actions.mutate, (state, action) => {
                    const { key, value, updated } = action.payload;
                    const record = state[key];
                    if (record) {
                        // Update the record with the new value and metadata.
                        record.value = castDraft(value);
                        record.updated = updated;
                        record.mutated = Date.now();
                        record.updates ??= 0;
                        record.updates++;
                    }
                })
                // Handles the 'trim' action to limit the number of cache records and remove invalid ones.
                .addCase(actions.trim, (state, action) => {
                    const { payload } = action;
                    const sortFn: CacheSortFn = payload.sort ?? sortCache; // Use custom sort function if provided.
                    const currentKeys = Object.keys(state);
                    const validKeys = Object.entries(state)
                        // Filter out invalid entries based on the provided validation function.
                        .filter(
                            ([_, value]) =>
                                !payload.validate ||
                                payload.validate(value as QueryCacheRecord<TType, TArgs>),
                        )
                        // Sort the remaining entries using the provided sort function.
                        .sort((a, b) => sortFn(a[1], b[1]))
                        // Limit the number of entries based on the specified size or default to MAX_SAFE_INTEGER.
                        .slice(0, payload.size ?? Number.MAX_SAFE_INTEGER)
                        // Map the entries to their keys.
                        .map(([key]) => key);

                    // Remove keys that are not in the list of valid keys.
                    if (currentKeys.length !== validKeys.length) {
                        for (const key of currentKeys) {
                            const validKeyIndex = validKeys.indexOf(key);
                            if (validKeyIndex !== -1) {
                                // If the key is valid, remove it from the search list.
                                validKeys.splice(validKeyIndex, 1);
                            } else {
                                // If the key is not valid, remove it from the state.
                                delete state[key];
                            }
                        }
                    }
                }),
    );
}
