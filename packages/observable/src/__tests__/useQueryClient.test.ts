import { act, renderHook } from '@testing-library/react-hooks';
import { zipWith, from } from 'rxjs';
import { QueryStatus } from '../query';
import { useQueryClient$, useQueryClient } from '../react';
import { emulateRequest } from './__mocks__/query.mock';

describe('useQueryClient$', () => {
    it('should create a query client', (complete) => {
        const expectedValue = 'test';
        const expectedData = [undefined, expectedValue];
        const expectedStatus = [QueryStatus.IDLE, QueryStatus.ACTIVE, QueryStatus.IDLE];

        const {
            result: { current: obj },
        } = renderHook(() => useQueryClient$(emulateRequest(10)));
        act(() => obj.query(expectedValue));

        obj.status$
            .pipe(zipWith(from(expectedStatus)))
            .subscribe(([value, expected]) => expect(value).toEqual(expected));

        obj.data$.pipe(zipWith(from(expectedData))).subscribe({
            next: ([value, expected]) => expect(value).toEqual(expected),
            complete,
        });
        expect.assertions(expectedData.length + expectedStatus.length);
    });
});

describe('useQueryClient', () => {
    it('should create a query client', async () => {
        const expected = 'test';

        const { result, waitForNextUpdate } = renderHook(() => useQueryClient(emulateRequest(10)));

        expect(result.current.status).toEqual(QueryStatus.IDLE);
        expect(result.current.data).toBeUndefined;

        act(() => result.current.query(expected));
        await waitForNextUpdate();

        expect(result.current.status).toEqual(QueryStatus.ACTIVE);
        expect(result.current.data).toBeUndefined;

        await waitForNextUpdate();

        expect(result.current.status).toEqual(QueryStatus.IDLE);
        expect(result.current.data).toEqual(expected);
    });
});
