import { useObservableSelector } from '../react/useObservableSelector';
import { renderHook } from '@testing-library/react-hooks';
import expect from 'expect';
import { from } from 'rxjs';

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
        const subject = from(expected);
        const { result } = renderHook(() => useObservableSelector(subject, 'value'));

        let counter = 0;
        result.current.subscribe({
            next: (value) => {
                expect(value).toBe(expected[counter].value);
                counter++;
            },
            complete,
        });
    });
});
