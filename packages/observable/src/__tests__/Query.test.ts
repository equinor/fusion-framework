import { Query } from '../query';
import { emulateRequest } from './__mocks__/query.mock';

describe('Query', () => {
    it.skip('should query', (complete) => {
        const expected = [{ iteration: 0 }, { iteration: 1 }, { iteration: 2 }];
        const key = 'test';
        const client = new Query({
            client: { fn: emulateRequest(10) },
            key: () => key,
            cache: {
                initial: { test: { value: expected[0] } },
            },
        });
        let iteration = 0;
        client.subscribe({
            next: (x) => {
                switch (iteration) {
                    case 1: {
                        client.next({ iteration: 2 });
                        break;
                    }

                    case 2: {
                        client.complete();
                        break;
                    }
                }
                expect(x).toHaveProperty(key);
                expect(x.test.value).toEqual(expected[iteration]);
                iteration++;
            },
            complete: () => {
                const item = client.state$.getItem('test');
                expect(item?.value).toEqual(expected[2]);
                expect(item?.args).toEqual(expected[2]);
                expect(item?.updates).toEqual(2);
                complete();
            },
        });
        client.next({ iteration: 1 });
    });
    // it('should debounce requests', (complete) => {
    //     const client = new Query(emulateRequest(10), { debounce: 100 });
    //     const expected = [undefined, { foo: 'bar' }];
    //     const queryArgs = expected[1];
    //     client.subscribe({
    //         next: (data) => {
    //             expect(data).toEqual(expected.shift());
    //             expected.length === 0 && client.complete();
    //         },
    //         complete,
    //     });
    //     client.next('first');
    //     defer(() => {
    //         client.next('second');
    //         defer(() => {
    //             client.next(queryArgs);
    //         }, 10);
    //     }, 10);
    // });

    // it('should respect completion', (complete) => {
    //     const client = new Query(emulateRequest(10), { debounce: 100 });
    //     client.subscribe({ complete });
    //     client.next('first');
    //     client.complete();
    // });

    // it('should reply last request', (complete) => {
    //     const queryArgs = { foo: 'bar' };
    //     const expected = [undefined, queryArgs, queryArgs];
    //     const client = new Query(emulateRequest());
    //     client.subscribe({
    //         next: (data) => {
    //             expect(data).toEqual(expected.shift());
    //             expected.length === 0 && client.complete();
    //         },
    //         complete,
    //     });
    //     client.next(queryArgs);
    //     defer(() => client.refresh(), 100);
    // });

    // it('should query async', async () => {
    //     const controller = new AbortController();
    //     const client = new Query(emulateRequest(100));
    //     const args = [{ foo: 'request 1' }, { foo: 'request 2' }, { foo: 'request 3' }];

    //     /** create a query which will be skipped */
    //     client.query(args[0]).catch((err) => {
    //         expect(err.cause).toMatchObject({
    //             type: ActionTypes.SKIPPED,
    //             payload: args[0],
    //             meta: {
    //                 next: {
    //                     args: args[1],
    //                 },
    //             },
    //         });
    //     });

    //     /** create a query which will be aborted */
    //     client.query(args[1], { controller }).catch((err) => {
    //         expect(err.cause).toMatchObject({
    //             type: ActionTypes.CANCEL,
    //             meta: {
    //                 request: {
    //                     type: ActionTypes.REQUEST,
    //                     payload: args[1],
    //                 },
    //             },
    //         });
    //     });

    //     /** abort query 2 */
    //     controller.abort();

    //     /** allow abort signal to dispatch */
    //     await defer(undefined, 10);

    //     /** execute final request */
    //     const result = await client.query(args[3]);
    //     expect(result.data).toBe(args[3]);
    // });
});
