import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import type { EventModule } from '@equinor/fusion-framework-module-event';
import { StateSyncEvent, type StateSyncEventType } from '@equinor/fusion-framework-module-state';

import useAppModule from '../useAppModule';

/**
 * Subscribes to the app's `state` module sync events (`onStateSync.status`,
 * `onStateSync.change`, `onStateSync.complete`, `onStateSync.error`) and returns the most
 * recent `limit` events, oldest first.
 *
 * Events are only dispatched while the state module's storage is configured for replication
 * (see `PouchDbSyncStorage`) - with the state module's default, local-only storage, this hook
 * returns an empty array.
 *
 * @param limit - Maximum number of most-recent sync events to retain.
 * @returns The most recent sync events, oldest first.
 *
 * @example
 * ```tsx
 * const events = useStateSyncEvents(20);
 * const lastEvent = events.at(-1);
 * ```
 *
 * @since 12.1.0
 */
export const useStateSyncEvents = (limit: number): StateSyncEventType[] => {
  const eventProvider = useAppModule<EventModule>('event');
  const [event$] = useState(() => new BehaviorSubject<StateSyncEventType[]>([]));

  // Read through a ref so changing `limit` trims the log without resubscribing.
  const limitRef = useRef(limit);
  limitRef.current = limit;

  useLayoutEffect(() => {
    // Narrow the shared event stream down to the sync-related events this hook exposes.
    const subscription = eventProvider.event$.pipe(filter(StateSyncEvent.is)).subscribe((event) => {
      const next = [...event$.getValue(), event];
      // Clamp to 0 so `slice(-0)` (a no-op, unlike `slice(-1)`) can't retain the whole log.
      const limit = Math.max(0, limitRef.current);
      event$.next(limit === 0 ? [] : next.length > limit ? next.slice(-limit) : next);
    });
    return () => subscription.unsubscribe();
  }, [eventProvider, event$]);

  return useSyncExternalStore(
    (onChange) => {
      const subscription = event$.subscribe(onChange);
      return () => subscription.unsubscribe();
    },
    () => event$.getValue(),
    () => event$.getValue(),
  );
};

export default useStateSyncEvents;
