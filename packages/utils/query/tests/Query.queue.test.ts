import { afterEach, describe, expect, it, vi } from 'vitest';
import { Query } from '../src/Query';
import { QueryClientError } from '../src/client';

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
        // Mock function that simulates async operation with a shorter delay
        const fn = vi.fn(
            (value: string) => new Promise((resolve) => setTimeout(() => resolve(value), 100)),
        );
        // Create a new Query instance with the 'switch' operator
        const query = new Query({
            queueOperator: 'switch',
            client: { fn }, // Client with the mock function
            key: (value) => value, // Key function that returns the input value
        });

        const tasks: Array<Promise<string | Error>> = [];

        // First task that gets aborted due to the 'switch' behavior
        tasks.push(
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    query.query('foo').subscribe({
                        next: () => {
                            reject('job should not emit value'); // Should not emit due to switch
                        },
                        error: (err) => {
                            // Expectations for the aborted request
                            expect(fn).toHaveBeenCalledTimes(1); // Function should have been called once at this point
                            expect(err).toBeInstanceOf(Error); // Error instance check
                            expect((err as QueryClientError).type).toEqual('abort'); // Error type check
                            resolve('job aborted'); // Resolve with a specific message
                        },
                        complete: () => {
                            reject('job should not complete'); // Job should not complete due to abort
                        },
                    });
                }, 0);
            }),
        );

        // Second task that completes successfully
        tasks.push(
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    query.query('bar').subscribe({
                        next: (e) => {
                            // Expect the result to match the object with value 'bar' and status 'complete'
                            expect(e).toMatchObject({ value: 'bar', status: 'complete' });
                        },
                        error: () => {
                            reject('job failed'); // Reject on error
                        },
                        complete: () => {
                            resolve('job completed'); // Resolve with a specific message on completion
                        },
                    });
                }, 10); // Set a slight delay to ensure this request comes after the first one
            }),
        );

        const task = await Promise.all(tasks); // Await all tasks
        expect(task).toEqual(['job aborted', 'job completed']); // Expect the correct resolution messages
        expect(fn).toHaveBeenCalledTimes(2); // Finally, expect the mock function to be called twice in total
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
