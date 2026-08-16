import { describe, it, expect, vi } from 'vitest';

import { BehaviorSubject, Subject } from 'rxjs';

import { renderHook } from 'vitest-browser-react';

import { useObservableState } from '../../src/react';
import type { StatefulObservable } from '../../src/types';

describe('useObservableState', () => {
  it('should sync state with an Observable', async () => {
    const subject = new Subject<number>();
    const { act, result } = await renderHook(() => useObservableState(subject));

    expect(result.current.value).toBeUndefined();
    expect(result.current.error).toBeNull();
    expect(result.current.complete).toBe(false);

    await act(() => {
      subject.next(1);
    });

    expect(result.current.value).toBe(1);
    expect(result.current.error).toBeNull();
    expect(result.current.complete).toBe(false);
  });

  it('should sync state with a Stateful Observable', async () => {
    const subject = new BehaviorSubject(0);
    const { act, result } = await renderHook(() => useObservableState(subject));

    expect(result.current.value).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.complete).toBe(false);

    await act(() => {
      subject.next(1);
    });

    expect(result.current.value).toBe(1);
    expect(result.current.error).toBeNull();
    expect(result.current.complete).toBe(false);
  });

  it('should prioritize explicit initial value over stateful observable value', async () => {
    // Make the plain Subject satisfy StatefulObservable by adding a `value` property
    const subject: Subject<number> & StatefulObservable<number> = Object.assign(
      new Subject<number>(),
      { value: 0 },
    );

    const { act, result } = await renderHook(() =>
      useObservableState(subject, {
        initial: 42,
      }),
    );

    expect(result.current.value).toBe(42);
    expect(result.current.error).toBeNull();
    expect(result.current.complete).toBe(false);

    await act(() => {
      subject.next(1);
    });

    expect(result.current.value).toBe(1);
  });

  it('should use provided initial value for a non-stateful observable', async () => {
    const subject = new Subject<number>();
    const { result } = await renderHook(() =>
      useObservableState(subject, {
        initial: 42,
      }),
    );

    expect(result.current.value).toBe(42);
    expect(result.current.error).toBeNull();
    expect(result.current.complete).toBe(false);
  });

  it('should expose error state when observable errors', async () => {
    const subject = new Subject<number>();
    const { act, result } = await renderHook(() => useObservableState(subject));
    const error = new Error('observable failed');

    await act(() => {
      subject.error(error);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.complete).toBe(false);
  });

  it('should expose completion state when observable completes', async () => {
    const subject = new Subject<number>();
    const { act, result } = await renderHook(() => useObservableState(subject));

    await act(() => {
      subject.complete();
    });

    expect(result.current.complete).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should invoke teardown when unsubscribing', async () => {
    const subject = new Subject<number>();
    const teardown = vi.fn();
    const { unmount } = await renderHook(() => useObservableState(subject, { teardown }));

    await unmount();

    expect(teardown).toHaveBeenCalledTimes(1);
  });

  describe('store stability', () => {
    it('should not recreate the store when a non-memoized complex initial object is passed on every render', async () => {
      const subject = new Subject<{ id: number }>();

      // Spy on Subject.subscribe to count store creations — each new store subscribes once.
      const subscribeSpy = vi.spyOn(subject, 'subscribe');

      const { rerender } = await renderHook(() =>
        useObservableState(subject, {
          // Intentionally non-memoized: a new object reference on every render.
          initial: { id: 0 },
        }),
      );

      await rerender();
      await rerender();
      await rerender();

      // The store should have been created once regardless of how many times the
      // component re-renders with a different initial object reference.
      expect(subscribeSpy).toHaveBeenCalledTimes(1);
    });

    it('should not recreate the store when a non-memoized teardown function is passed on every render', async () => {
      const subject = new Subject<number>();
      const subscribeSpy = vi.spyOn(subject, 'subscribe');

      const { rerender } = await renderHook(() =>
        useObservableState(subject, {
          // Intentionally non-memoized: a new arrow function on every render.
          teardown: () => {},
        }),
      );

      await rerender();
      await rerender();
      await rerender();

      expect(subscribeSpy).toHaveBeenCalledTimes(1);
    });

    it('should recreate the store when the subject reference changes', async () => {
      const subjectA = new BehaviorSubject(1);
      const subjectB = new BehaviorSubject(2);

      const spyA = vi.spyOn(subjectA, 'subscribe');
      const spyB = vi.spyOn(subjectB, 'subscribe');

      let activeSubject = subjectA as BehaviorSubject<number>;
      const { result, rerender } = await renderHook(() => useObservableState(activeSubject));

      expect(result.current.value).toBe(1);

      activeSubject = subjectB;
      await rerender();

      expect(result.current.value).toBe(2);
      expect(spyA).toHaveBeenCalledTimes(1);
      expect(spyB).toHaveBeenCalledTimes(1);
    });

    it('should keep the mounted initial value until the new subject emits', async () => {
      const subjectA = new Subject<{ label: string }>();
      const subjectB = new Subject<{ label: string }>();

      let activeSubject = subjectA as Subject<{ label: string }>;
      const initialValue = { label: 'first' };

      const { act, result, rerender } = await renderHook(() =>
        useObservableState(activeSubject, { initial: initialValue }),
      );

      expect(result.current.value).toEqual({ label: 'first' });

      activeSubject = subjectB;
      await rerender();

      expect(result.current.value).toEqual({ label: 'first' });

      await act(() => {
        subjectB.next({ label: 'second' });
      });

      expect(result.current.value).toEqual({ label: 'second' });
    });

    it('should keep the first subject when deps is empty', async () => {
      const subjectA = new Subject<number>();
      const subjectB = new Subject<number>();

      const spyA = vi.spyOn(subjectA, 'subscribe');
      const spyB = vi.spyOn(subjectB, 'subscribe');

      let activeSubject = subjectA as Subject<number>;
      const { act, result, rerender } = await renderHook(() =>
        useObservableState(activeSubject, { deps: [] }),
      );

      activeSubject = subjectB;
      await rerender();

      await act(() => {
        subjectB.next(2);
      });

      expect(result.current.value).toBeUndefined();

      await act(() => {
        subjectA.next(1);
      });

      expect(result.current.value).toBe(1);
      expect(spyA).toHaveBeenCalledTimes(1);
      expect(spyB).not.toHaveBeenCalled();
    });

    it('should recreate the subscription when custom deps change', async () => {
      const subjectA = new Subject<number>();
      const subjectB = new Subject<number>();

      const spyA = vi.spyOn(subjectA, 'subscribe');
      const spyB = vi.spyOn(subjectB, 'subscribe');

      let activeSubject = subjectA as Subject<number>;
      let subscriptionKey = 'a';

      const { act, result, rerender } = await renderHook(() =>
        useObservableState(activeSubject, { deps: [subscriptionKey] }),
      );

      activeSubject = subjectB;
      await rerender();

      await act(() => {
        subjectB.next(2);
      });

      expect(result.current.value).toBeUndefined();
      expect(spyA).toHaveBeenCalledTimes(1);
      expect(spyB).not.toHaveBeenCalled();

      subscriptionKey = 'b';
      await rerender();

      await act(() => {
        subjectB.next(2);
      });

      expect(result.current.value).toBe(2);
      expect(spyA).toHaveBeenCalledTimes(1);
      expect(spyB).toHaveBeenCalledTimes(1);
    });
  });
});
