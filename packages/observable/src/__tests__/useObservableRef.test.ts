import { useObservableRef } from '../react/useObservableRef';
import { renderHook } from '@testing-library/react-hooks';
import expect from 'expect';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
describe('useObservableRef', () => {
    it('should allow undefined initial value', () => {
        const subject = new Observable();
        const {
            result: { current: ref },
        } = renderHook(() => useObservableRef(subject));
        expect(ref.current).toBeUndefined();
    });
    it('should allow initial value', () => {
        const subject = new Observable();
        const initial = 'test';
        const {
            result: { current: ref },
        } = renderHook(() => useObservableRef(subject, initial));
        expect(ref.current).toEqual(initial);
    });
    it('should take initial value from a subject', () => {
        const initial = 'test';
        const subject = new BehaviorSubject(initial);
        const {
            result: { current: ref },
        } = renderHook(() => useObservableRef(subject));
        expect(ref.current).toEqual(initial);
    });
    it('should update ref when subject emits', (complete) => {
        const expected = [1, 2];
        const subject = new BehaviorSubject(expected[0]);
        subject.subscribe({ complete });

        const {
            result: { current: ref },
        } = renderHook(() => useObservableRef(subject));

        expect(ref.current).toEqual(expected.shift());

        subject.next(expected[0]);
        expect(ref.current).toEqual(expected.shift());
        subject.complete();
    });
    it('should not rerender when subject emits', (complete) => {
        const subject = new Subject();
        let renders = 0;
        const {
            result: { current: ref },
        } = renderHook(() => {
            renders++;
            return useObservableRef(subject);
        });
        expect(renders).toEqual(1);
        Array.from({ length: 9 }, (_, i) => subject.next(++i));
        expect(renders).toEqual(1);
        expect(ref.current).toEqual(9);
        complete();
    });
});
