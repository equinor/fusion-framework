/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Represents a single record in the query cache with generic types for the value and arguments.
 * @typeParam TType - The type of the value stored in the cache record.
 * @typeParam TArgs - The type of the arguments associated with the cache record.
 */
export type QueryCacheRecord<TType = unknown, TArgs = unknown> = {
    /**
     * The value of the cache record, which can be of any type.
     */
    value: TType;
    /**
     * The arguments associated with the cache record, which can be of any type.
     */
    args: TArgs;

    uuid?: string;
    /**
     * A unique identifier for the transaction associated with the cache record.
     */
    transaction: string;
    /**
     * The timestamp when the cache record was created, represented as a number.
     */
    created: number;
    /**
     * An optional timestamp when the cache record was last updated, represented as a number.
     */
    updated?: number;
    /**
     * An optional count of how many times the cache record has been updated.
     */
    updates?: number;
    /**
     * An optional timestamp when the cache record was last mutated, represented as a number.
     */
    mutated?: number;
};

/**
 * Defines the shape of the state data for the query cache, which is a record where keys are strings
 * and values are QueryCacheRecord instances with generic types for the value and arguments.
 * @typeParam TType - The type of the value stored in the cache records.
 * @typeParam TArgs - The type of the arguments associated with the cache records.
 */
export type QueryCacheStateData<TType = unknown, TArgs = unknown> = Record<
    string,
    QueryCacheRecord<TType, TArgs>
>;

/**
 * Represents a mutation to be applied to the query cache.
 * @typeParam TType - The type of the value to be mutated in the cache.
 */
export type QueryCacheMutation<TType = unknown> = {
    /**
     * The new value to be set in the cache record.
     */
    value: TType;
    /**
     * An optional timestamp when the mutation occurred, represented as a number.
     */
    updated?: number;
};

/**
 * Represents the state of the query cache, which is a mapping from string keys to QueryCacheRecord instances.
 * @typeParam TType - The type of the value stored in the cache records.
 * @typeParam TArgs - The type of the arguments associated with the cache records.
 */
export type QueryCacheState<TType = unknown, TArgs = unknown> = QueryCacheStateData<TType, TArgs>;

/**
 * Defines a function type for sorting cache records, taking two QueryCacheRecord instances and
 * returning a number indicating their sort order.
 * @typeParam TType - The type of the value stored in the cache records.
 * @typeParam TArgs - The type of the arguments associated with the cache records.
 * @param a - The first QueryCacheRecord instance for comparison.
 * @param b - The second QueryCacheRecord instance for comparison.
 * @returns A number that determines the order of the records; a negative number if `a` should come before `b`,
 * zero if they are considered equal, or a positive number if `a` should come after `b`.
 */
export type CacheSortFn<TType = any, TArgs = any> = (
    a: QueryCacheRecord<TType, TArgs>,
    b: QueryCacheRecord<TType, TArgs>,
) => number;
