import { renderHook } from '@testing-library/react-hooks';
import { Observable } from 'rxjs';
import { useObservableInput, useObservableInputState } from '../react';

describe('useObservableInput.ts', () => {
    it('should create an observable input', () => {
        const { result } = renderHook(() => useObservableInput(Promise.resolve(11)));
        expect(result.current).toBeInstanceOf(Observable);
    });
    it('should resolve state of observable input', async () => {
        const expected = 11;
        const { result, waitFor } = renderHook(() =>
            useObservableInputState(Promise.resolve(expected)),
        );
        await waitFor(() => {
            expect(result.current).toEqual(expected);
        });
    });
});
