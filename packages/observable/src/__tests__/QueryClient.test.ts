import { QueryClient } from '../query';
import { ActionType } from '../query/actions';
import { defer, emulateRequest } from './__mocks__/query.mock';

describe('QueryClient', () => {
    it('should query', (complete) => {
        const expected = [undefined, { foo: 'bar' }];
        const queryArgs = expected[1];
        const client = new QueryClient(emulateRequest(10));
        client.subscribe({
            next: (data) => {
                expect(data).toEqual(expected.shift());
                expected.length === 0 && client.complete();
            },
            complete,
        });
        client.next(queryArgs);
    });
    it('should debounce requests', (complete) => {
        const client = new QueryClient(emulateRequest(10), { debounce: 100 });
        const expected = [undefined, { foo: 'bar' }];
        const queryArgs = expected[1];
        client.subscribe({
            next: (data) => {
                expect(data).toEqual(expected.shift());
                expected.length === 0 && client.complete();
            },
            complete,
        });
        client.next('first');
        defer(() => {
            client.next('second');
            defer(() => {
                client.next(queryArgs);
            }, 10);
        }, 10);
    });

    it('should respect completion', (complete) => {
        const client = new QueryClient(emulateRequest(10), { debounce: 100 });
        client.subscribe({ complete });
        client.next('first');
        client.complete();
    });

    it('should reply last request', (complete) => {
        const queryArgs = { foo: 'bar' };
        const expected = [undefined, queryArgs, queryArgs];
        const client = new QueryClient(emulateRequest());
        client.subscribe({
            next: (data) => {
                expect(data).toEqual(expected.shift());
                expected.length === 0 && client.complete();
            },
            complete,
        });
        client.next(queryArgs);
        defer(() => client.refresh(), 100);
    });

    it('should query async', async () => {
        const controller = new AbortController();
        const client = new QueryClient(emulateRequest(100));
        const args = [{ foo: 'request 1' }, { foo: 'request 2' }, { foo: 'request 3' }];

        /** create a query which will be skipped */
        client.query(args[0]).catch((err) => {
            expect(err.cause).toMatchObject({
                type: ActionType.SKIPPED,
                payload: args[0],
                meta: {
                    next: {
                        args: args[1],
                    },
                },
            });
        });

        /** create a query which will be aborted */
        client.query(args[1], { controller }).catch((err) => {
            expect(err.cause).toMatchObject({
                type: ActionType.CANCEL,
                meta: {
                    request: {
                        type: ActionType.REQUEST,
                        payload: args[1],
                    },
                },
            });
        });

        /** abort query 2 */
        controller.abort();

        /** allow abort signal to dispatch */
        await defer(undefined, 10);

        /** execute final request */
        const result = await client.query(args[3]);
        expect(result.data).toBe(args[3]);
    });
});
