import { describe, expect, vi, it } from 'vitest';
import { Query } from '../src/Query';
import { QueryTaskCached } from '../src/types';
import { firstValueFrom, toArray } from 'rxjs';

describe('Mutations of queries', () => {
    it('should alter the cached value', async () => {
        // Mock a function to simulate fetching data
        const fn = vi.fn((value) => Promise.resolve(value));
        // Initialize a new Query with a mock client, a key function, and an expiration time
        const query = new Query({
            client: { fn },
            key: (id) => id,
            expire: 1000,
        });

        // Mock a function to observe mutations
        const onMutate = vi.fn();

        // Register the onMutate function to be called on mutations
        query.onMutate(onMutate);

        // Perform the first query which should fetch data from the server
        const firstResult = await query.queryAsync('foo');
        // Check that the result is not mutated
        expect('mutated' in firstResult).toBeFalsy();
        // Ensure the fetch function was called once
        expect(fn).toHaveBeenCalledTimes(1);
        // Ensure the onMutate function was not called yet
        expect(onMutate).toHaveBeenCalledTimes(0);

        // Mutate the cache for the key 'foo'
        query.mutate('foo', (prev) => {
            // Verify the previous value is as expected
            expect(prev).toEqual('foo');
            // Return a new value and the current timestamp to simulate a mutation
            return { value: 'bar', updated: Date.now() };
        });

        // Query again to get the mutated value
        const secondResult = await query.queryAsync('foo');
        // Check that the result now comes from the cache
        expect(secondResult.status).toBe('cache');
        // Verify the mutated value is as expected
        expect(secondResult.value).toBe('bar');
        // Ensure the result is marked as mutated
        expect((secondResult as QueryTaskCached<string>).mutated).toBeTruthy();
        // Check that the mutation count is incremented
        expect((secondResult as QueryTaskCached<string>).updates).toBe(1);
        // Confirm the fetch function was still only called once
        expect(fn).toHaveBeenCalledTimes(1);
        // Ensure the onMutate function has been called once after mutation
        expect(onMutate).toHaveBeenCalledTimes(1);
    });

    it('should have invalid cache after mutation, when not providing updated property', async () => {
        const query = new Query({
            client: { fn: vi.fn((value) => Promise.resolve(value)) }, // Mock the client's function to resolve with the provided value
            key: (id) => id, // Use the identity function for keys, meaning the key is the same as the value provided
            expire: 1000, // Set cache expiration time to 1000 milliseconds
        });

        // prime the cache with initial data by querying 'foo'
        await query.queryAsync('foo');

        // Mutate the cache for the key 'foo' without providing an 'updated' timestamp
        query.mutate('foo', () => ({ value: 'bar' }));

        // Execute the query again, but this time collect all emitted values using an observable sequence converted to an array
        const result = await firstValueFrom(query.query('foo').pipe(toArray()));

        expect(result).toMatchObject([
            // Check that the initial cache state after mutation matches expectations:
            // - status should be 'cache', indicating the value is served from cache
            // - value should be 'bar', the mutated value
            // - updates should be 1, indicating the cache was updated once
            // - updated property should be undefined since it wasn't provided during mutation
            { status: 'cache', value: 'bar', updates: 1, updated: undefined },
            // Check the final state after re-fetching:
            // - status should be 'complete', indicating the query completed successfully
            // - value should revert to 'foo', the original value, since the cache expired and the value was re-fetched
            { status: 'complete', value: 'foo' },
        ]);
    });

    it('should fail when mutating if there are no records with matching key', async () => {
        // Create a new Query instance with a mocked fetch function, a simple key function, and an expiration time
        const query = new Query({
            client: { fn: vi.fn() }, // Mocked client function that does nothing
            key: (id) => id, // Key function that returns the same id provided
            expire: 1000, // Cache expiration time in milliseconds
        });

        // Attempt to mutate the cache for a key 'foo' that does not exist in the cache
        // This should throw an error because the cache item with key 'foo' cannot be found
        expect(() => query.mutate('foo', () => ({ value: 'bar' }))).toThrowError(
            /Cannot mutate cache item with key .*: item not found/,
        );
    });
});
