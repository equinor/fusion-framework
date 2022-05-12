import expect from 'expect';
import { renderHook, act } from '@testing-library/react-hooks';

import { useObservableEffect } from '../react/useObservableEffect';
import { useObservable } from '../react/useObservable';

import { Reducer } from '../types';

const reducer: Reducer<
    { sum: number },
    { type: 'add'; payload: number } | { type: 'requestAdd'; payload: number }
> = (state, action) => {
    switch (action.type) {
        case 'add':
            return { ...state, sum: state.sum + action.payload };
    }
    return state;
};

describe('useObservableEffect', () => {
    it('effect', async () => {
        const { result, waitFor } = renderHook(() => {
            const subject = useObservable(reducer, { sum: 0 });
            useObservableEffect(subject, async (action) => {
                switch (action.type) {
                    case 'requestAdd': {
                        expect(action.payload).toBe(1);
                        return { type: 'add', payload: action.payload } as const;
                    }
                }
            });

            return subject;
        });

        act(() => {
            result.current.next({ type: 'requestAdd', payload: 1 });
            expect(result.current.value.sum).toBe(0);
        });

        await waitFor(() => {
            expect(result.current.value.sum).toBe(1);
        });
    });
});
