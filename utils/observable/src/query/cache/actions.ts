import type { PayloadAction } from '../..';
import type { QueryCacheRecord } from './types';

export type QueryCacheActions<TType = unknown, TArgs = unknown> = {
    set: PayloadAction<
        'set',
        {
            key: string;
            value: {
                value: TType;
                args: TArgs;
                transaction: string;
                created?: number;
            };
        }
    >;
    clear: PayloadAction<'clear', { key: string }>;
    reset: PayloadAction<'reset', { data?: Record<string, TType> }>;
    invalidate: PayloadAction<'invalidate', { key: string }>;
    trim: PayloadAction<
        'trim',
        {
            sort?: (a: QueryCacheRecord<TType, TArgs>, b: QueryCacheRecord<TType, TArgs>) => number;
            validate?: (item: QueryCacheRecord<TType, TArgs>) => boolean;
            size?: number;
        }
    >;
};

export type QueryCacheActionTypes<TType = unknown, TArgs = unknown> = {
    [K in keyof QueryCacheActions]: QueryCacheActions<TType, TArgs>[K];
}[keyof QueryCacheActions];
