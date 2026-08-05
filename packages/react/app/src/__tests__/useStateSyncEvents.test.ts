import { describe, it, expect, vi } from 'vitest';
import { Subject } from 'rxjs';

import { act, renderHook } from '@testing-library/react';

import { StateSyncEvent, type StateSyncEventType } from '@equinor/fusion-framework-module-state';

const event$ = new Subject<StateSyncEventType>();

vi.mock('../useAppModule', () => ({
  default: () => ({ event$ }),
}));

import { useStateSyncEvents } from '../state/useStateSyncEvents';

describe('useStateSyncEvents', () => {
  it('collects dispatched onStateSync.* events, oldest first', () => {
    const { result } = renderHook(() => useStateSyncEvents(10));

    expect(result.current).toEqual([]);

    act(() => {
      event$.next(new StateSyncEvent.Status({ detail: { status: 'active' } }));
      event$.next(new StateSyncEvent.Status({ detail: { status: 'paused' } }));
    });

    expect(result.current).toHaveLength(2);
    expect(result.current[0].detail.status).toBe('active');
    expect(result.current[1].detail.status).toBe('paused');
  });

  it('ignores events unrelated to state sync and trims the log to the given limit', () => {
    const { result } = renderHook(() => useStateSyncEvents(1));

    act(() => {
      event$.next(new StateSyncEvent.Status({ detail: { status: 'active' } }));
      event$.next(new StateSyncEvent.Error({ detail: { error: new Error('boom'), type: 'error' } }));
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toBeInstanceOf(StateSyncEvent.Error);
  });

  it('unsubscribes from the event stream on unmount', () => {
    const { result, unmount } = renderHook(() => useStateSyncEvents(10));

    unmount();

    act(() => {
      event$.next(new StateSyncEvent.Status({ detail: { status: 'active' } }));
    });

    expect(result.current).toEqual([]);
  });
});
