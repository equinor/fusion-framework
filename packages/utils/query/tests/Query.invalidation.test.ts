import { describe, expect, it, vi } from 'vitest';
import { Query } from '../src/Query';
import { reduce } from 'rxjs';

describe('invalidation of queries', () => {
    it('should invalidate the cache', async () => {
        // Initializes a new Query instance with a mock client, a key generator function, and an expiration time.
        const query = new Query({
            client: { fn: vi.fn(async (value) => value) }, // Mock client function that resolves immediately with the provided value.
            key: (id) => id, // Key generator function that returns the provided id.
            expire: 1000, // Sets cache expiration time to 1000 milliseconds.
        });

        // First query execution, expected to complete and not use the cache.
        const firstResult = await query.queryAsync('foo');
        expect(firstResult.status).toBe('complete'); // Asserts that the first query's status is 'complete'.

        // Second query execution, expected to retrieve the result from cache.
        const secondResult = await query.queryAsync('foo');
        expect(secondResult.status).toBe('cache'); // Asserts that the second query's status is 'cache' indicating it was retrieved from cache.

        // Invalidates the cache for all queries.
        query.invalidate();

        // Third query execution post-invalidation, expected to first hit the cache, then complete after fetching.
        const thirdResult = await new Promise<string[]>(
            (resolve) =>
                query
                    .query('foo') // Initiates a query for 'foo'.
                    .pipe(
                        reduce((acc, value) => [...acc, value.status], [] as string[]), // Reduces the status messages into an array.
                    )
                    .subscribe(resolve), // Resolves the promise with the array of status messages.
        );
        expect(thirdResult).toMatchObject(['cache', 'complete']); // Asserts that the status messages are as expected.
    });
});
