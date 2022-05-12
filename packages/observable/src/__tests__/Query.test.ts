import { Query, QueryError } from '../query';
import { ActionType } from '../query/actions';
import { QueryStatus } from '../query/types';

import { defer, emulateRequest, emulateRetry } from './__mocks__/query.mock';

describe('Query', () => {
    it('should query', (complete) => {
        const expected = [
            { status: QueryStatus.IDLE },
            { status: QueryStatus.ACTIVE },
            {
                status: QueryStatus.IDLE,
                completed: expect.any(Number),
            },
        ];
        const client = emulateRequest();
        const query = new Query(client);
        query.subscribe({
            next: (state) => {
                expect(state).toMatchObject({ ...expected.shift() });
                expected.length === 0 && query.complete();
            },
            complete,
        });
        query.next();

        expect.assertions(3);
    });

    it('should fail when error thrown', async () => {
        const cause = Error('it failed');
        const client = () =>
            defer(() => {
                throw cause;
            }, 10);
        const query = new Query(client);
        try {
            await query.nextAsync('should fail');
        } catch (err) {
            expect(err).toBeInstanceOf(QueryError);
            expect(err).toHaveProperty('type', QueryError.TYPE.ERROR);
            expect(err).toHaveProperty('cause.cause', cause);
        }
        expect.assertions(3);
    });

    it('should abort on signal', (complete) => {
        const expected = [
            { status: QueryStatus.IDLE },
            { status: QueryStatus.ACTIVE },
            {
                status: QueryStatus.CANCELED,
            },
        ];
        const client = emulateRequest(10);
        const controller = new AbortController();
        const query = new Query(client);
        query.subscribe({
            next: (state) => {
                expect(state).toMatchObject({ ...expected.shift() });
                expected.length === 0 && query.complete();
            },
            complete,
        });
        query.next('should be aborted', { controller });
        defer(() => controller.abort());

        expect.assertions(3);
    });

    it('should cancel on call', (complete) => {
        const expected = [
            { status: QueryStatus.IDLE },
            { status: QueryStatus.ACTIVE },
            {
                status: QueryStatus.CANCELED,
            },
        ];
        const client = emulateRequest();
        const query = new Query(client);
        query.subscribe({
            next: (state) => {
                expect(state).toMatchObject({ ...expected.shift() });
                expected.length === 0 && query.complete();
            },
            complete,
        });
        query.next('should be canceled');
        defer(() => query.cancel());

        expect.assertions(3);
    });

    describe('Retry', () => {
        it('should retry request when failed', () => {
            const expected = 'test';
            const client = emulateRetry(3, 10);
            const query = new Query(client, { retry: { count: 3 } });
            return query.nextAsync(expected);
        });
        it('should fail when too many retries', () => {
            const expected = 'test';
            const client = emulateRetry(3, 10);
            const query = new Query(client, { retry: { count: 1 } });
            expect(query.nextAsync(expected)).rejects.toBeInstanceOf(Error);
        });
        it('should cancel retry', async () => {
            const expected = 'call1';
            const client = emulateRetry(1, 10);
            const query = new Query(client, { retry: { count: 1 } });
            defer(() => query.cancel('cancel now'), 10);
            const request = query.nextAsync(expected);
            expect(request).rejects.toBeInstanceOf(QueryError);
            expect(request).rejects.toHaveProperty('type', QueryError.TYPE.ABORT);
            expect(request).rejects.toHaveProperty('cause.message', 'cancel now');
        });
        it('should abort retry', async () => {
            const expected = 'call1';
            const client = emulateRetry(1, 5);
            const controller = new AbortController();
            const query = new Query(client);
            defer(() => controller.abort(), 10);
            const request = query.nextAsync(expected, { controller, retry: { count: 1 } });
            expect(request).rejects.toBeInstanceOf(QueryError);
            expect(request).rejects.toHaveProperty('type', QueryError.TYPE.ABORT);
            expect(query.value.status === QueryStatus.CANCELED);
        });
    });

    describe('Effects', () => {
        it('should allow adding effects', (complete) => {
            const client = emulateRequest(10);
            const expected = [ActionType.REQUEST, ActionType.SUCCESS];
            const query = new Query(client);
            query.on(ActionType.REQUEST, (action) => {
                expect(action.type).toEqual(ActionType.REQUEST);
            });
            query.action$.subscribe({
                next: (action) => {
                    expect(action.type).toEqual(expected.shift());
                    expected.length === 0 && query.complete();
                },
                complete,
            });
            query.next('');
        });
    });
    describe('Async', () => {
        it('should query async', () => {
            const expected = 'test';
            const client = emulateRequest<string>();
            const query = new Query(client);
            return expect(query.nextAsync(expected)).resolves.toEqual(expected);
        });

        it('should abort query async', async () => {
            const client = emulateRequest();
            const controller = new AbortController();
            const query = new Query(client);
            const request = query.nextAsync('', { controller });
            defer(() => controller.abort());

            try {
                await request;
            } catch (err) {
                expect(err).toBeInstanceOf(QueryError);
                expect(query.value.status).toEqual(QueryStatus.CANCELED);
            }
            expect.assertions(2);
        });

        it('should cancel query async', async () => {
            const message = 'canceled by abort controller';
            const client = emulateRequest<void>();
            const query = new Query(client);

            const request = query.nextAsync();
            defer(() => query.cancel(message));
            try {
                await request;
            } catch (err) {
                expect(err).toBeInstanceOf(QueryError);
                expect((err as QueryError).cause?.message).toEqual(message);
                expect(query.value.status).toEqual(QueryStatus.CANCELED);
            }
            expect.assertions(3);
        });
    });
});
