import { useObservableState } from '../react/useObservableState';
import { renderHook, act } from '@testing-library/react-hooks';
import expect from 'expect';
import { BehaviorSubject, Observable } from 'rxjs';

describe('useObservableState', () => {
    it('should allow undefined initial value', () => {
        const subject = new Observable();
        const {
            result: { current: state },
        } = renderHook(() => useObservableState(subject));
        expect(state).toBeUndefined();
    });
    it('should allow initial value', () => {
        const subject = new Observable();
        const initial = 'test';
        const {
            result: { current: state },
        } = renderHook(() => useObservableState(subject, initial));
        expect(state).toEqual(initial);
    });
    it('should take initial value from a subject', () => {
        const initial = 'test';
        const subject = new BehaviorSubject(initial);
        const {
            result: { current: state },
        } = renderHook(() => useObservableState(subject));
        expect(state).toEqual(initial);
    });
    it('should update state when subject emits', () => {
        const expected = [1, 2, 3, 4, 5];
        const expectedRenderCounts = expected.length;

        const subject = new BehaviorSubject(expected[0]);

        let renderCount = 0;
        const { result } = renderHook(() => {
            renderCount++;
            return useObservableState(subject);
        });

        expect(result.current).toEqual(expected.shift());

        while (expected.length) {
            act(() => subject.next(expected[0]));
            expect(result.current).toEqual(expected.shift());
        }

        expect(renderCount).toBe(expectedRenderCounts);
    });
});
