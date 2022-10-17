import type { PayloadAction } from '../..';
import type { QueryCacheRecord } from './types';

export type QueryCacheActions<TType = unknown, TArgs = unknown> = {
    set: PayloadAction<
        'set',
        {
            key: string;
            value: QueryCacheRecord<TType, TArgs>;
        }
    >;
    clear: PayloadAction<'clear', { key: string }>;
    reset: PayloadAction<'reset', { data?: Record<string, TType> }>;
    invalidate: PayloadAction<'invalidate', { key: string }>;
    refresh: PayloadAction<'refresh', { key: string }>;
};

export type QueryCacheActionTypes<TType = unknown, TArgs = unknown> = {
    [K in keyof QueryCacheActions]: QueryCacheActions<TType, TArgs>[K];
}[keyof QueryCacheActions];
