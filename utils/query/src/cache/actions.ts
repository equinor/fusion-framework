import type { PayloadAction } from '@equinor/fusion-observable';
import type { QueryCacheRecord } from './types';

export type QueryCacheActions<TType = unknown, TArgs = unknown> = {
    set: PayloadAction<
        {
            key: string;
            value: {
                value: TType;
                args: TArgs;
                transaction: string;
                created?: number;
            };
        },
        'set'
    >;
    clear: PayloadAction<{ key: string }, 'clear'>;
    reset: PayloadAction<{ data?: Record<string, TType> }, 'reset'>;
    invalidate: PayloadAction<{ key: string }, 'invalidate'>;
    trim: PayloadAction<
        {
            sort?: (a: QueryCacheRecord<TType, TArgs>, b: QueryCacheRecord<TType, TArgs>) => number;
            validate?: (item: QueryCacheRecord<TType, TArgs>) => boolean;
            size?: number;
        },
        'trim'
    >;
};

export type QueryCacheActionTypes<TType = unknown, TArgs = unknown> = {
    [K in keyof QueryCacheActions]: QueryCacheActions<TType, TArgs>[K];
}[keyof QueryCacheActions];
