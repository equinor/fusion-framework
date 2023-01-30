import { useObservableSelectorState } from '../react/useObservableSelectorState';
import { act, renderHook } from '@testing-library/react-hooks';
import expect from 'expect';
import { Subject } from 'rxjs';

describe('useSelector', () => {
    it('should select value from observable state', (complete) => {
        const expected = [
            {
                value: 1,
            },
            {
                value: 2,
            },
        ];
        const subject = new Subject<(typeof expected)[0]>();
        const { result } = renderHook(() => useObservableSelectorState(subject, 'value'));
        expected.forEach((x, i) => {
            act(() => {
                subject.next(x);
            });
            expect(result.current).toBe(expected[i].value);
        });
        complete();
    });
});
