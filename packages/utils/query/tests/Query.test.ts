import { it, describe, expect, vi } from 'vitest';

import { Query } from '../src/Query';
import { QueryClientError } from '../src/client';

describe('Query', () => {
    it('should execute an query', async () => {
        const expected = 'foo';
        const query = new Query({
            client: {
                fn: async (value: string) => value,
            },
            key: () => 'bar',
        });
        const result = await query.queryAsync('foo');
        expect(result.value).toEqual(expected);
    });
    it('should cache entry', async () => {
        const expected = 'foo';
        let calls = 0;
        const query = new Query({
            expire: 100,
            client: {
                fn: async (value: string) => {
                    calls++;
                    return value;
                },
            },
            key: (value) => value,
        });
        const result = await query.queryAsync('foo');
        expect(calls).toBe(1);
        expect(result.value).toEqual(expected);
        const cached = query.cache.getItem(result.ref!);
        expect(cached?.value).toEqual(expected);
        expect(calls).toBe(1);
        const result2 = await query.queryAsync(expected);
        expect(result2.status).toEqual('cache');
        expect(result2.value).toEqual(result.value);
        expect(calls).toBe(1);
    });
    it('should cancel request on signal', async () => {
        const query = new Query({
            client: {
                fn: (value: string) =>
                    new Promise((resolve) => setTimeout(() => resolve(value), 1000)),
            },
            key: (value) => value,
        });
        const controller = new AbortController();
        const task = query.queryAsync('foo', { signal: controller.signal });
        controller.abort();
        try {
            await task;
        } catch (err) {
            expect(err).instanceOf(QueryClientError);
            expect((err as QueryClientError).type === 'abort');
        }
    });
    it('should combine multiple request when queue operator is `merge`', async () => {
        const expected = ['foo', 'bar'];
        let calls = 0;
        vi.useFakeTimers();
        const query = new Query({
            queueOperator: 'merge',
            expire: 1000,
            client: {
                fn: async (value: string) => {
                    calls++;
                    return new Promise((resolve) => {
                        setTimeout(() => resolve(value), 100);
                    });
                },
            },
            key: (value) => value,
        });
        const task = Promise.all([
            query.queryAsync('foo'),
            query.queryAsync('foo'),
            query.queryAsync('bar'),
        ]);
        vi.runAllTimersAsync();
        const results = await task;
        expect(calls).toBe(2);
        expect(results[0]).toEqual(results[1]);
        expect(results[0].value).toEqual(expected[0]);
        expect(results[1].value).toEqual(expected[0]);
        expect(results[2].value).toEqual(expected[1]);
    });
    it('should switch to new request when queue operator is `switch`', async () => {
        const expected = ['foo', 'bar', 'foobar'];
        let calls = 0;
        vi.useFakeTimers();
        const query = new Query({
            queueOperator: 'switch',
            expire: 1000,
            client: {
                fn: async (value: string) => {
                    calls++;
                    return new Promise((resolve) => {
                        setTimeout(() => resolve(value), 100);
                    });
                },
            },
            key: (value) => value,
        });

        const tasks: Array<Promise<boolean>> = [];
        tasks.push(
            query
                .queryAsync('foo')
                .then(() => false)
                .catch((err) => {
                    expect(calls).toBe(2);
                    expect(err).toBeInstanceOf(QueryClientError);
                    expect((err as QueryClientError).type).toEqual('abort');
                    return true;
                }),
        );
        tasks.push(
            new Promise((resolve) => {
                setTimeout(async () => {
                    expect(calls).toBe(1);
                    await query.queryAsync('bar');
                    resolve(true);
                }, 50);
            }),
        );
        tasks.push(
            new Promise((resolve) => {
                setTimeout(async () => {
                    expect(calls).toBe(2);
                    await query.queryAsync('foobar');
                    resolve(true);
                }, 150);
            }),
        );

        const task = Promise.all(tasks);
        vi.runAllTimersAsync();
        const result = await task;
        expect(calls).toBe(3);
        result.forEach((e) => expect(e).toBeTruthy());
    });
    it.skip('should execute consecutive when queue operator is `concat`');
});
