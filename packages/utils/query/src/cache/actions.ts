import { ActionInstanceMap, ActionTypes, createAction } from '@equinor/fusion-observable';
import { CacheSortFn, QueryCacheRecord } from './types';

/**
 * Creates a set of actions for manipulating the cache.
 *
 * @template TType - The type of the cache value.
 * @template TArgs - The type of the cache arguments.
 * @returns An object containing the cache actions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function createActions<TType = any, TArgs = any>() {
    return {
        set: createAction(
            'cache/set',
            /**
             * Sets a cache entry.
             *
             * @param key - The unique key for the cache entry.
             * @param entry - The cache entry object containing value, args, and transaction.
             * @returns An action with the type 'cache/set' and the payload containing the key and entry.
             */
            (key: string, entry: { value: TType; args: TArgs; transaction: string }) => {
                return { payload: { key, entry } };
            },
        ),
        remove: createAction(
            'cache/remove',
            /**
             * Removes a cache entry.
             *
             * @param key - The unique key for the cache entry to remove.
             * @returns An action with the type 'cache/remove' and the payload containing the key.
             */
            (key: string) => ({ payload: key }),
        ),

        invalidate: createAction(
            'cache/invalidate',
            /**
             * Invalidates a cache entry or the entire cache if no key is provided.
             *
             * @param key - The unique key for the cache entry to invalidate. If omitted, all entries are invalidated.
             * @returns An action with the type 'cache/invalidate' and the payload containing the key or undefined.
             */
            (key?: string) => ({ payload: key }),
        ),
        trim: createAction(
            'cache/trim',
            /**
             * Trims the cache based on a sorting function, a validation function, and a size limit.
             *
             * @param payload - An object containing optional sort function, validate function, and size limit.
             * @returns An action with the type 'cache/trim' and the payload containing the provided arguments.
             */
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionBuilder<TType = any, TArgs = any> = ReturnType<
    typeof createActions<TType, TArgs>
>;

export const actions = createActions();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionMap<TType = any, TArgs = any> = ActionInstanceMap<ActionBuilder<TType, TArgs>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Actions<TType = any, TArgs = any> = ActionTypes<ActionMap<TType, TArgs>>;
