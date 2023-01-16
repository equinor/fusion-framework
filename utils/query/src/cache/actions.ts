import { ActionInstanceMap, ActionTypes, createAction } from '@equinor/fusion-observable';
import { CacheSortFn, QueryCacheRecord } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function createActions<TType = any, TArgs = any>() {
    return {
        set: createAction(
            'cache/set',
            (key: string, entry: { value: TType; args: TArgs; transaction: string }) => {
                return { payload: { key, entry } };
            }
        ),
        remove: createAction('cache/remove', (key: string) => ({ payload: key })),
        invalidate: createAction('cache/invalidate', (key: string) => ({ payload: key })),
        trim: createAction(
            'cache/trim',
            (payload: {
                sort?: CacheSortFn<TType, TArgs>;
                validate?: (item: QueryCacheRecord<TType, TArgs>) => boolean;
                size?: number;
            }) => {
                return { payload };
            }
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
