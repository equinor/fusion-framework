import { afterEach, describe, expect, it, vi } from 'vitest';
import { Query } from '../src/Query.js';

describe('Query queue operators', () => {
  // Clean up after each test case by using real timers
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should combine multiple request when queue operator is `merge`', async () => {
    const expected = ['foo', 'bar']; // Expected result array
    vi.useFakeTimers(); // Use fake timers to control async flow
    // Mock function that simulates async operation with a delay
    const fn = vi.fn(
      (value: string) => new Promise((resolve) => setTimeout(() => resolve(value), 10)),
    );
    // Create a new Query instance with the 'merge' operator
    const query = new Query({
      queueOperator: 'merge',
      expire: 1000, // Set expiration time for the cache
      client: { fn }, // Client with the mock function
      key: (value) => value, // Key function that returns the input value
    });
    // Create a task that queries the same value ('foo') twice and a different value ('bar') once
    const task = Promise.all([
      query.queryAsync('foo'),
      query.queryAsync('foo'),
      query.queryAsync('bar'),
    ]);
    vi.runAllTimersAsync(); // Execute all timers immediately
    const results = await task; // Await the results of all queries
    expect(fn).toHaveBeenCalledTimes(2); // Expect the mock function to be called twice
    expect(results[0]).toEqual(results[1]); // First two results should be equal
    expect(results[0].value).toEqual(expected[0]); // Check the value of the first result
    expect(results[1].value).toEqual(expected[0]); // Check the value of the second result
    expect(results[2].value).toEqual(expected[1]); // Check the value of the third result
  });
  it('should switch to new request when queue operator is `switch`', async () => {
    vi.useFakeTimers();
    const fn = vi.fn(
      (value: string) => new Promise<string>((resolve) => setTimeout(() => resolve(value), 100)),
    );
    const query = new Query({
      queueOperator: 'switch',
      client: { fn },
      key: (value) => value,
    });
    const next = vi.fn();
    const error = vi.fn();
    const complete = vi.fn();
    query.query('foo').subscribe({ next, error, complete });

    // Start the first client without relying on wall-clock scheduling under CI load.
    await vi.advanceTimersByTimeAsync(10);
    expect(fn).toHaveBeenCalledTimes(1);

    const task = query.queryAsync('bar');
    await vi.runAllTimersAsync();

    await expect(task).resolves.toMatchObject({ value: 'bar', status: 'complete' });
    expect(next).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledExactlyOnceWith(expect.any(Error));
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ type: 'abort' }));
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it('should execute consecutive when queue operator is `concat`', async () => {
    // Mock function with conditional delay to ensure sequential execution
    const fn = vi.fn(
      (value: string) =>
        new Promise<string>((resolve) =>
          setTimeout(() => resolve(value), value === 'foo' ? 10 : 5),
        ),
    );
    // Create a new Query instance with the 'concat' operator
    const query = new Query({
      queueOperator: 'concat',
      client: { fn }, // Client with the mock function
      key: (value) => value, // Key function that returns the input value
    });
    const tasks: Array<Promise<string>> = [];

    // Push two tasks to the array, ensuring they will be executed sequentially
    tasks.push(query.queryAsync('foo').then((e) => e.value)); // First task with 'foo'
    tasks.push(query.queryAsync('bar').then((e) => e.value)); // Second task with 'bar'

    const task = await Promise.all(tasks); // Await all tasks to complete
    expect(task).toEqual(['foo', 'bar']); // Expect the tasks to complete in order with correct values
  });
});
