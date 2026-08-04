import { Observable } from 'rxjs';

import { v4 as uuid } from 'uuid';

import type { SyncEvent } from './types';

/**
 * Converts PouchDB replication callbacks into an observable event stream.
 *
 * @template T - The replicated document type.
 * @param sync - The PouchDB synchronization object to observe.
 * @returns An observable that emits synchronization events.
 */
export function ObserveSync<T extends {}>(
  sync: PouchDB.Replication.Sync<T>,
): Observable<SyncEvent<T>> {
  return new Observable<SyncEvent<T>>((subscriber) => {
    const dispatchEvent = (
      type: SyncEvent<T>['type'],
      detail?: { info?: PouchDB.Replication.SyncResult<T>; error?: unknown },
    ): void => {
      subscriber.next({
        id: uuid(),
        type,
        info: detail?.info,
        timestamp: new Date().toISOString(),
      });
    };
    const handlers = {
      change: (info: PouchDB.Replication.SyncResult<T>) => dispatchEvent('change', { info }),
      complete: () => dispatchEvent('complete'),
      paused: () => dispatchEvent('paused'),
      active: () => dispatchEvent('active'),
      error: (error: unknown) => dispatchEvent('error', { error }),
      denied: (error: unknown) => dispatchEvent('denied', { error }),
    };

    // Register every replication callback so consumers receive a complete event history.
    for (const [key, handler] of Object.entries(handlers)) {
      // @ts-ignore
      sync.on(key, handler);
    }

    return () => {
      // Remove every callback when the observable subscription is disposed.
      for (const [key, handler] of Object.entries(handlers)) {
        // @ts-ignore
        sync.off(key, handler);
      }
    };
  });
}

export default ObserveSync;
