import { ActionInstanceMap, ActionTypes, createAction } from '@equinor/fusion-observable';
import { CacheSortFn, QueryCacheMutation, QueryCacheRecord } from './types';

/**
 * Creates a set of actions to manipulate cache entries.
 *
 * @template TType The type of the value being cached.
 * @template TArgs The type of the arguments associated with the cache entry.
 * @returns An object containing the cache actions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function createActions<TType = any, TArgs = any>() {
    return {
        /**
         * Action to set a cache entry.
         *
         * @param key The cache key.
         * @param entry The cache entry, including value, arguments, and transaction identifier.
         * @returns An action object with the cache key and entry.
         */
        set: createAction(
            'cache/set',
            (key: string, entry: { value: TType; args: TArgs; transaction: string }) => {
                return { payload: { key, entry } };
            },
        ),
        /**
         * Action to remove a cache entry.
         *
         * @param key The cache key to remove.
         * @returns An action object with the cache key.
         */
        remove: createAction('cache/remove', (key: string) => ({ payload: key })),
        /**
         * Action to invalidate a cache entry.
         *
         * @param key The cache key to invalidate.
         * @returns An action object with the cache key.
         */
        invalidate: createAction('cache/invalidate', (key?: string, item?: QueryCacheRecord) => ({
            payload: key,
            meta: { item },
        })),
        /**
         * Action to mutate a cache entry.
         *
         * @param changes An object containing the cache key, new value, and optional updated timestamp and transaction identifier.
         * @param current The current cache record, if available.
         * @returns An action object with the changes to be applied to the cache entry and the current cache record as metadata.
         */
        mutate: createAction(
            'cache/mutate',
            (
                key: string,
                changes: QueryCacheMutation<TType>,
                item?: QueryCacheRecord<TType, TArgs>,
            ) => ({ payload: { ...changes, key }, meta: { item } }),
        ),
        /**
         * Action to trim the cache based on certain criteria.
         *
         * @param payload Object containing optional sort function, validation function, and size limit.
         * @returns An action object with the payload.
         */
        trim: createAction(
            'cache/trim',
            (payload: {
                sort?: CacheSortFn<TType, TArgs>;
                validate?: (item: QueryCacheRecord<TType, TArgs>) => boolean;
                size?: number;
            }) => {
                return { payload };
            },
        ),
    };
}

/**
 * Type representing the builder function for cache actions.
 *
 * @template TType The type of the value being cached.
 * @template TArgs The type of the arguments associated with the cache entry.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionBuilder<TType = any, TArgs = any> = ReturnType<
    typeof createActions<TType, TArgs>
>;

/**
 * The singleton actions object containing all cache manipulation actions.
 */
export const actions = createActions();

/**
 * Type representing the map of action instances for a given value and argument types.
 *
 * @template TType The type of the value being cached.
 * @template TArgs The type of the arguments associated with the cache entry.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionMap<TType = any, TArgs = any> = ActionInstanceMap<ActionBuilder<TType, TArgs>>;

/**
 * Type representing the actions available for cache manipulation.
 *
 * @template TType The type of the value being cached.
 * @template TArgs The type of the arguments associated with the cache entry.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Actions<TType = any, TArgs = any> = ActionTypes<ActionMap<TType, TArgs>>;
