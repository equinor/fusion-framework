export type QueryCacheRecord<TType = unknown, TArgs = unknown> = {
    // key: string;
    value: TType;
    args: TArgs;
    transaction: string;
    created: number;
    updated?: number;
    updates?: number;
};

export type QueryCacheStateData<TType = unknown, TArgs = unknown> = Record<
    string,
    QueryCacheRecord<TType, TArgs>
>;

export type QueryCacheState<TType = unknown, TArgs = unknown> = QueryCacheStateData<TType, TArgs>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CacheSortFn<TType = any, TArgs = any> = (
    a: QueryCacheRecord<TType, TArgs>,
    b: QueryCacheRecord<TType, TArgs>,
) => number;
