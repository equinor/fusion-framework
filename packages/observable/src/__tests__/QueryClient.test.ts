import { QueryClient } from '../query';
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
});
