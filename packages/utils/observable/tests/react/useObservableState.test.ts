import { describe, it, expect } from 'vitest';

import { BehaviorSubject, Subject } from 'rxjs';

import { renderHook, waitFor } from '@testing-library/react';

import { useObservableState } from '../../src/react';

describe('useObservableState', () => {
    it('should sync state with an Observable', async () => {
        const subject = new Subject();
        const { result } = renderHook(() => useObservableState(subject));

        expect(result.current.value).toBeUndefined;

        await waitFor(() => {
            subject.next(1);
        });

        expect(result.current.value).toBe(1);
    });

    it('should sync state with an Stateful Observable', async () => {
        const subject = new BehaviorSubject(0);
        const { result } = renderHook(() => useObservableState(subject));

        expect(result.current.value).toBeUndefined;
        expect(result.current.value).toBe(0);

        await waitFor(() => {
            subject.next(1);
        });

        expect(result.current.value).toBe(1);
    });
});
