import { describe, it, expect, vi } from 'vitest';

import { BehaviorSubject, Subject } from 'rxjs';

import { act, renderHook } from '@testing-library/react';

import { useObservableState } from '../../src/react';
import type { StatefulObservable } from '../../src/types';

describe('useObservableState', () => {
  it('should sync state with an Observable', () => {
    const subject = new Subject<number>();
    const { result } = renderHook(() => useObservableState(subject));

    expect(result.current.value).toBeUndefined();
    expect(result.current.error).toBeNull();
    expect(result.current.complete).toBe(false);

    act(() => {
      subject.next(1);
    });

    expect(result.current.value).toBe(1);
    expect(result.current.error).toBeNull();
    expect(result.current.complete).toBe(false);
  });

  it('should sync state with a Stateful Observable', () => {
    const subject = new BehaviorSubject(0);
    const { result } = renderHook(() => useObservableState(subject));

    expect(result.current.value).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.complete).toBe(false);

    act(() => {
      subject.next(1);
    });

    expect(result.current.value).toBe(1);
    expect(result.current.error).toBeNull();
    expect(result.current.complete).toBe(false);
  });

  it('should prioritize explicit initial value over stateful observable value', () => {
    const subject: Subject<number> & StatefulObservable<number> = Object.assign(
      new Subject<number>(),
      { value: 0 },
    );

    const { result } = renderHook(() =>
      useObservableState(subject, {
        initial: 42,
      }),
    );

    expect(result.current.value).toBe(42);
    expect(result.current.error).toBeNull();
    expect(result.current.complete).toBe(false);

    act(() => {
      subject.next(1);
    });

    expect(result.current.value).toBe(1);
  });

  it('should use provided initial value for a non-stateful observable', () => {
    const subject = new Subject<number>();
    const { result } = renderHook(() =>
      useObservableState(subject, {
        initial: 42,
      }),
    );

    expect(result.current.value).toBe(42);
    expect(result.current.error).toBeNull();
    expect(result.current.complete).toBe(false);
  });

  it('should expose error state when observable errors', () => {
    const subject = new Subject<number>();
    const { result } = renderHook(() => useObservableState(subject));
    const error = new Error('observable failed');

    act(() => {
      subject.error(error);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.complete).toBe(false);
  });

  it('should expose completion state when observable completes', () => {
    const subject = new Subject<number>();
    const { result } = renderHook(() => useObservableState(subject));

    act(() => {
      subject.complete();
    });

    expect(result.current.complete).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should invoke teardown when unsubscribing', () => {
    const subject = new Subject<number>();
    const teardown = vi.fn();
    const { unmount } = renderHook(() => useObservableState(subject, { teardown }));

    unmount();

    expect(teardown).toHaveBeenCalledTimes(1);
  });

  describe('store stability', () => {
    it('should not recreate the store when a non-memoized complex initial object is passed on every render', () => {
      const subject = new Subject<{ id: number }>();

      // Spy on Subject.subscribe to count store creations — each new store subscribes once.
      const subscribeSpy = vi.spyOn(subject, 'subscribe');

      const { rerender } = renderHook(() =>
        useObservableState(subject, {
          // Intentionally non-memoized: a new object reference on every render.
          initial: { id: 0 },
        }),
      );

      rerender();
      rerender();
      rerender();

      // The store should have been created once regardless of how many times the
      // component re-renders with a different initial object reference.
      expect(subscribeSpy).toHaveBeenCalledTimes(1);
    });

    it('should not recreate the store when a non-memoized teardown function is passed on every render', () => {
      const subject = new Subject<number>();
      const subscribeSpy = vi.spyOn(subject, 'subscribe');

      const { rerender } = renderHook(() =>
        useObservableState(subject, {
          // Intentionally non-memoized: a new arrow function on every render.
          teardown: () => {},
        }),
      );

      rerender();
      rerender();
      rerender();

      expect(subscribeSpy).toHaveBeenCalledTimes(1);
    });

    it('should recreate the store when the subject reference changes', () => {
      const subjectA = new BehaviorSubject(1);
      const subjectB = new BehaviorSubject(2);

      const spyA = vi.spyOn(subjectA, 'subscribe');
      const spyB = vi.spyOn(subjectB, 'subscribe');

      let activeSubject = subjectA as BehaviorSubject<number>;
      const { result, rerender } = renderHook(() => useObservableState(activeSubject));

      expect(result.current.value).toBe(1);

      activeSubject = subjectB;
      rerender();

      expect(result.current.value).toBe(2);
      expect(spyA).toHaveBeenCalledTimes(1);
      expect(spyB).toHaveBeenCalledTimes(1);
    });

    it('should use the latest initial value when the subject changes', () => {
      const subjectA = new Subject<{ label: string }>();
      const subjectB = new Subject<{ label: string }>();

      let activeSubject = subjectA as Subject<{ label: string }>;
      let initialValue = { label: 'first' };

      const { result, rerender } = renderHook(() =>
        useObservableState(activeSubject, { initial: initialValue }),
      );

      expect(result.current.value).toEqual({ label: 'first' });

      // Switch to a new subject with an updated initial value.
      activeSubject = subjectB;
      initialValue = { label: 'second' };
      rerender();

      expect(result.current.value).toEqual({ label: 'second' });
    });
  });

  describe('persist option', () => {
    it('should not recreate the store when subject reference changes and persist=true', () => {
      const subjectA = new BehaviorSubject(1);
      const subjectB = new BehaviorSubject(99);

      const spyA = vi.spyOn(subjectA, 'subscribe');
      const spyB = vi.spyOn(subjectB, 'subscribe');

      let activeSubject = subjectA as BehaviorSubject<number>;
      const { result, rerender } = renderHook(() =>
        useObservableState(activeSubject, { persist: true }),
      );

      expect(result.current.value).toBe(1);

      // Swap subject — the store should ignore it because persist=true.
      activeSubject = subjectB;
      rerender();

      expect(result.current.value).toBe(1);
      expect(spyA).toHaveBeenCalledTimes(1);
      expect(spyB).not.toHaveBeenCalled();
    });
  });
});
