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
});
