import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { Subject } from 'rxjs';

import { StateSyncEvent, type StateSyncEventType } from '@equinor/fusion-framework-module-state';
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

const event$ = new Subject<StateSyncEventType>();

vi.mock('../useAppModule', () => ({
  default: () => ({ event$ }),
}));

import { useStateSyncEvents } from '../state/useStateSyncEvents';

describe('useStateSyncEvents', () => {
  it('collects dispatched onStateSync.* events, oldest first', async () => {
    const { result } = await renderAppHook(() => useStateSyncEvents(10));

    expect(result.current).toEqual([]);

    act(() => {
      event$.next(new StateSyncEvent.Status({ detail: { status: 'active' } }));
      event$.next(new StateSyncEvent.Status({ detail: { status: 'paused' } }));
    });

    expect(result.current).toMatchObject([
      { detail: { status: 'active' } },
      { detail: { status: 'paused' } },
    ]);
  });

  it('ignores events unrelated to state sync and trims the log to the given limit', async () => {
    const { result } = await renderAppHook(() => useStateSyncEvents(1));

    act(() => {
      event$.next(new StateSyncEvent.Status({ detail: { status: 'active' } }));
      event$.next(
        new StateSyncEvent.Error({ detail: { error: new Error('boom'), type: 'error' } }),
      );
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toBeInstanceOf(StateSyncEvent.Error);
  });

  it('unsubscribes from the event stream on unmount', async () => {
    const { result, unmount } = await renderAppHook(() => useStateSyncEvents(10));

    unmount();

    act(() => {
      event$.next(new StateSyncEvent.Status({ detail: { status: 'active' } }));
    });

    expect(result.current).toEqual([]);
  });
});
