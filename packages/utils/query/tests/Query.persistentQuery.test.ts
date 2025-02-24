import { describe, expect, it, vi } from 'vitest';
import { Query } from '../src/Query';
import type { QueryTaskValue } from '../src/types';

describe('Persistent queries', () => {
  it('should emit when the cache is mutated', async () => {
    vi.useFakeTimers();
    // Initializes a new Query instance with a mock client, a key generator function, and an expiration time.
    const query = new Query({
      client: { fn: (value) => Promise.resolve(value) }, // Mock client function that resolves immediately with the provided value.
      key: (id) => id, // Key generator function that returns the provided id.
      expire: 1000, // Sets cache expiration time to 1000 milliseconds.
    });

    const result = [] as QueryTaskValue<string>[];

    // First query execution, expected to complete and not use the cache.
    query.persistentQuery('foo').subscribe((value) => result.push(value));

    await vi.advanceTimersByTimeAsync(10);

    // mutate the cache
    query.mutate('foo', { value: 'foobar' });
    await vi.advanceTimersByTimeAsync(10);

    // refresh the query
    query.query('foo').subscribe();
    await vi.advanceTimersByTimeAsync(100);

    // await vi.advanceTimersToNextTimerAsync();
    const expected = [
      { status: 'complete', value: 'foo' },
      { status: 'cache', value: 'foobar', updates: 1 },
      { status: 'cache', value: 'foo', updates: 2 },
    ];

    expect(result).toMatchObject(expected);
  });
});
