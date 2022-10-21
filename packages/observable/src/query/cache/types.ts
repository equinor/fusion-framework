export type QueryCacheRecord<TType = unknown, TArgs = unknown> = {
    value: TType;
    args?: TArgs;
    transaction?: string;
    created?: number;
    updated?: number;
    updates?: number;
};

export type QueryCacheStateData<TType = unknown, TArgs = unknown> = Record<
    string,
    QueryCacheRecord<TType, TArgs>
>;

export type QueryCacheState<TType = unknown, TArgs = unknown> = {
    data: QueryCacheStateData<TType, TArgs>;
    lastTransaction?: string;
};
