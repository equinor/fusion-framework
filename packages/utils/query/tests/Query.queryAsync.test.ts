import { it, describe, expect, vi, afterEach } from 'vitest';

import { Query } from '../src/Query';

describe('Query Async', () => {
    // Resetting to real timers after each test to ensure isolation
    // between tests and avoid interference from fake timers.
    afterEach(() => {
        vi.useRealTimers();
    });

    // Test case to verify the execution of an async query.
    it('should execute an query', async () => {
        // Mocking a function to simulate the async operation of a query.
        const fn = vi.fn(async (value: string) => value);
        // Instantiating a new Query with a mocked client and a key generator.
        const query = new Query({
            client: {
                fn,
            },
            key: () => 'foo',
        });
        // Executing the query asynchronously.
        const result = await query.queryAsync('foo');
        // Asserting that the query result matches the expected outcome.
        expect(result.value).toEqual('foo');
        expect(result.status).toEqual('complete');
        expect(result.transaction).toBeDefined();
        expect(result.created).toBeDefined();
        // Verifying that the mocked function was called exactly once.
        expect(fn).toHaveBeenCalledOnce();
    });

    // Test case to verify that queries are cached and reused.
    it('should cache queries', async () => {
        const fn = vi.fn(async (value: string) => value);
        const query = new Query({
            expire: 100, // Setting cache expiration time to 100ms.
            client: {
                fn,
            },
            key: (value) => value, // Using the input value as the cache key.
        });
        // Executing the query for the first time to populate the cache.
        await query.queryAsync('foo');

        // Executing the same query again to fetch from the cache.
        const result = await query.queryAsync('foo');
        // Asserting that the result was fetched from the cache.
        expect(result.status).toEqual('cache');
        // Verifying that the underlying query function was only called once,
        // indicating that the second call was served from the cache.
        expect(fn).toHaveBeenCalledOnce();
    });

    // Test case to verify that expired cache entries trigger a refetch.
    it('should refetch when entry is expired', async () => {
        vi.useFakeTimers();
        const fn = vi.fn(async (value: string) => value);
        const query = new Query({
            expire: 100, // Setting cache expiration time to 100ms.
            client: {
                fn,
            },
            key: (value) => value, // Using the input value as the cache key.
        });

        // Executing the query to populate the cache.
        await vi.waitFor(() => query.queryAsync('foo'));
        // Advancing the fake timers by 100ms to simulate cache expiration.
        await vi.advanceTimersByTimeAsync(100);

        // Executing the query again after cache expiration.
        const result = await vi.waitFor(() => query.queryAsync('foo'));

        // Asserting that a new fetch was performed due to cache expiration.
        expect(result.status).toEqual('complete');
        // Verifying that the query function was called twice, indicating
        // that the cache was bypassed on the second call due to expiration.
        expect(fn).toHaveBeenCalledTimes(2);
    });

    // Test case to verify behavior when cache is expired but resolution is skipped.
    it('should provided cached query when expired, if `skipResolve` is true', async () => {
        vi.useFakeTimers();
        const fn = vi.fn(async (value: string) => value);
        const query = new Query({
            expire: 100, // Setting cache expiration time to 100ms.
            client: {
                fn,
            },
            key: (value) => value, // Using the input value as the cache key.
        });

        // Executing the query to populate the cache.
        await vi.waitFor(() => query.queryAsync('foo'));
        // Advancing the fake timers by 100ms to simulate cache expiration.
        await vi.advanceTimersByTimeAsync(100);

        // Executing the query again with `skipResolve` option after cache expiration.
        const result = await vi.waitFor(() => query.queryAsync('foo', { skipResolve: true }));

        // Asserting that the result was fetched from the cache despite expiration,
        // due to the `skipResolve` option being true.
        expect(result.status).toEqual('cache');
        // Verifying that the query function was called only once, indicating
        // that no new fetch was performed and the expired cache was used.
        expect(fn).toHaveBeenCalledTimes(1);
    });

    // Test case to verify that updates can be skipped if the cache is considered invalid.
    it('should skip update, if `suppressInvalid`is true', async () => {
        vi.useFakeTimers();
        const fn = vi.fn(async (value: string) => value);
        const query = new Query({
            expire: 100, // Setting cache expiration time to 100ms.
            client: {
                fn,
            },
            key: (value) => value, // Using the input value as the cache key.
        });

        // Executing the query to populate the cache.
        await vi.waitFor(() => query.queryAsync('foo'));

        // Executing the query again with `suppressInvalid` option.
        const result = await vi.waitFor(() =>
            query.queryAsync('foo', { cache: { suppressInvalid: true } }),
        );

        // Asserting that the result was fetched from the cache.
        expect(result.status).toEqual('cache');
        // Verifying that the query function was called only once, indicating
        // that no new fetch was performed and the cache was not updated
        // even though it might be considered invalid.
        expect(fn).toHaveBeenCalledTimes(1);
    });
});
