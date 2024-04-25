import { it, describe, expect, vi } from 'vitest';

import { Query } from '../src/Query';

import { interval, lastValueFrom, merge, EmptyError } from 'rxjs';
import { reduce, takeUntil } from 'rxjs/operators';
import { type QueryTaskValue } from '../src/types';

vi.stubEnv('FUSION_LOG_LEVEL', '0');

describe('Query query', () => {
    it('should query when observed', async () => {
        // Mock a function to simulate the client's behavior.
        const fn = vi.fn(async (value: string) => value);
        // Initialize the Query client with a mocked client and a key function.
        const queryClient = new Query({
            client: {
                fn,
            },
            key: (value) => value,
        });
        // Perform a query with the key 'foo'.
        const result$ = queryClient.query('foo');
        // Verify the function has not been called yet since the query is lazy.
        expect(fn).not.toHaveBeenCalled();
        // Await the result of the query to force execution.
        await lastValueFrom(result$);
        // Verify the function was called once after awaiting the query result.
        expect(fn).toHaveBeenCalledOnce();
    });

    it('should connect queries', async () => {
        // Mock a function to return the input value as a promise.
        const fn = vi.fn(async (value: string) => value);
        // Initialize the Query client with the mocked function and a key function that returns the input value.
        const queryClient = new Query({
            client: {
                fn,
            },
            key: (value) => value,
        });
        // Perform two queries with the same key 'bar' and merge their results.
        // The reduce operator accumulates the emitted values into an array.
        const result = await lastValueFrom(
            merge(queryClient.query('bar'), queryClient.query('bar')).pipe(
                reduce((acc, value) => [...acc, value], [] as QueryTaskValue<string>[]),
            ),
        );
        // Verify the mocked function was called only once due to query de-duplication.
        expect(fn).toHaveBeenCalledTimes(1);
        // Check that the result array contains two elements.
        expect(result.length).toBe(2);
        // Verify both elements in the result array are the expected query result objects.
        expect(result[0]).toMatchObject({ value: 'bar' });
        // Ensure both results in the array are identical, demonstrating both queries returned the same result.
        expect(result[0]).toEqual(result[1]);
    });

    it('should handle errors', async () => {
        // Mock a function that always throws an error when called
        const fn = vi.fn(async (_: string) => {
            throw Error('error');
        });
        // Initialize the Query client with the mocked function that throws an error
        const queryClient = new Query({
            client: {
                fn,
            },
            key: (value) => value, // Use the input value as the query key
        });
        try {
            // Attempt to perform a query that is expected to fail
            await lastValueFrom(queryClient.query('foo'));
        } catch (e) {
            // Verify that the caught exception is an instance of Error
            expect(e).toBeInstanceOf(Error);
            // Verify that the error message is what was thrown by the mocked function
            expect(e.message).toBe('error');
        }
    });

    it('should cancel requests when no longer subscribed', async () => {
        // Define a mock function that returns a promise which resolves after 10ms with the input value
        const fn = vi.fn(
            (value: string) =>
                new Promise<string>((resolve) => {
                    setTimeout(() => {
                        resolve(value);
                    }, 10);
                }),
        );
        // Initialize the Query client with the mocked function and a key function that simply returns the input value
        const queryClient = new Query({
            client: { fn },
            key: (value) => value,
        });

        try {
            // Perform a query and cancel it after 50ms using the takeUntil operator with an interval
            // This simulates a scenario where the subscriber is no longer interested in the result after 50ms
            await lastValueFrom(queryClient.query('bar').pipe(takeUntil(interval(5))));
        } catch (e) {
            // Expect the promise to be rejected with an EmptyError due to cancellation
            expect(e).toBeInstanceOf(EmptyError);
        }
    });

    it('should cancel request on signal', async () => {
        // Define a mock function that simulates an asynchronous operation,
        // such as fetching data from an API. This function returns a promise
        // that resolves after a delay, simulating a network request.
        const fn = vi.fn(
            (value: string) => new Promise((resolve) => setTimeout(() => resolve(value))),
        );
        // Initialize a new Query instance with the mock function and a simple key function.
        // The key function is used to uniquely identify queries.
        const query = new Query({
            client: { fn },
            key: (value) => value,
        });
        // Create a new AbortController instance. This controller will be used to
        // send a signal to abort the asynchronous operation initiated by the query.
        const controller = new AbortController();
        // Execute the query with an additional option to pass the abort signal.
        // The `queryAsync` method is used here, which is presumably a variant of the `query`
        // method that supports passing an options object, including an AbortSignal.
        const task = query.queryAsync('foo', { signal: controller.signal });
        // Schedule the abort action to be executed after a delay. This simulates a user
        // action or another event that leads to the cancellation of the request.
        setTimeout(() => controller.abort());
        try {
            // Await the result of the query. Since the request will be aborted,
            // this line is expected to throw an error, which is then caught in the catch block below.
            await task;
            // If the request is not aborted as expected, force an error to ensure the test fails.
            throw Error('Should not reach here');
        } catch (err) {
            // Verify that the error caught is an instance of Error, indicating that the request
            // was aborted as expected, and the correct error handling behavior was triggered.
            expect(err).instanceOf(Error);
            // Check that the error message matches the expected message for an aborted query.
            // This ensures that the error handling logic correctly identifies aborted requests.
            expect(err.message).toBe('Query aborted');
        }
        // Verify that the mock function was called exactly once. This ensures that the query
        // was initiated before being aborted, and no unnecessary calls were made.
        expect(fn).toHaveBeenCalledOnce();
    });
});
