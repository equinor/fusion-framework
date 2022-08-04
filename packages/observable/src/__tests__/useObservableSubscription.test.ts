import { renderHook, act } from '@testing-library/react-hooks';
import { Subject } from 'rxjs';
import { useObservableSubscription } from '../react';
describe('useObservableSubscription', () => {
    it('should subscribe with an effect', (complete) => {
        const subject = new Subject<string>();
        const expected = 'foo';
        const cb = (value: string) => expect(value).toEqual(expected);
        expect(subject.observed).toBeFalsy();
        const { unmount } = renderHook(() => useObservableSubscription(subject, cb, complete));
        expect(subject.observed).toBeTruthy();
        act(() => subject.next(expected));
        act(() => unmount());
        expect(subject.observed).toBeFalsy();
        expect.assertions(4);
    });
});
