import { BehaviorSubject, of, Subject } from 'rxjs';

import { describe, expect, it, vi } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';

import { useObservableExternalStore } from '../../src/react/useObservableExternalStore';

describe('useObservableExternalStore', () => {
    it('should observe state with initial value', async () => {
        const subject = new Subject();
        const { result } = renderHook(() => useObservableExternalStore(subject, 0));

        expect(result.current.value).toBe(0);
    });

    it('should observe state', async () => {
        const subject = new Subject();
        const { result } = renderHook(() => useObservableExternalStore(subject));

        await waitFor(() => {
            subject.next(1);
        });

        expect(result.current.value).toBe(1);
    });

    it('should complete when source completes', async () => {
        const subject = new Subject();
        const { result } = renderHook(() => useObservableExternalStore(subject));

        expect(result.current.complete).toBeUndefined;

        await waitFor(() => {
            subject.complete();
        });

        expect(result.current.complete).toBe(true);
    });

    it('should handle error', async () => {
        const subject = new Subject();
        const { result } = renderHook(() => useObservableExternalStore(subject));

        expect(result.current.value).toBeUndefined;

        await waitFor(() => {
            subject.error(new Error('error'));
        });

        expect(result.current.error).toBeInstanceOf(Error);
    });

    it('should allow changing source', async () => {
        const source1 = of(1);
        const source2 = of(2);

        const { result, rerender } = renderHook(
            ({ source }) => useObservableExternalStore(source),
            { initialProps: { source: source1 } },
        );

        expect(result.current.value).toBe(1);

        rerender({ source: source2 });

        expect(result.current.value).toBe(2);
    });

    it('should call teardown of a cold observer when subject is complete', async () => {
        const teardown = vi.fn();
        const source = of(1);

        renderHook(() => useObservableExternalStore(source, 0, { teardown }));
        expect(teardown).toBeCalledTimes(1);
    });

    it('should call teardown of a hot observer when component unmounts', async () => {
        const teardown = vi.fn();
        const source = new BehaviorSubject(1);

        const { unmount } = renderHook(() => useObservableExternalStore(source, 0, { teardown }));

        expect(teardown).toBeCalledTimes(0);

        unmount();

        expect(teardown).toBeCalledTimes(1);
    });

    it('should call teardown on change of source', async () => {
        const source1 = new BehaviorSubject(1);
        const source2 = new BehaviorSubject(2);

        const teardown = vi.fn();

        const { rerender, unmount } = renderHook(
            ({ source }) => useObservableExternalStore(source, 0, { teardown }),
            {
                initialProps: { source: source1 },
            },
        );

        rerender({ source: source2 });

        expect(teardown).toBeCalledTimes(1);

        unmount();

        expect(teardown).toBeCalledTimes(2);
    });

    it('should allow custom compare function, only allow even numbers', async () => {
        const subject = new Subject<number>();
        const isOdd = (a: number) => a % 2 === 1;
        const { result } = renderHook(() =>
            useObservableExternalStore(subject, 0, {
                compare: isOdd,
            }),
        );

        await waitFor(() => {
            subject.next(1);
        });

        expect(result.current.value).toBe(0);

        await waitFor(() => {
            subject.next(2);
        });

        expect(result.current.value).toBe(2);

        await waitFor(() => {
            subject.next(64);
        });

        expect(result.current.value).toBe(64);
    });
});
