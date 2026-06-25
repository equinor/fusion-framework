import { Observable } from 'rxjs';
import type { AllowedValue } from '../types.js';
import type { StorageItem } from './types.js';
import { StateSyncEvent, type StateSyncEventType } from '../events/index.js';

/**
 * Observes PouchDB synchronization events and converts them into standardized state sync events.
 *
 * This function creates an Observable that emits events for various synchronization states,
 * including changes, completions, errors, and status updates. It's designed to work with
 * PouchDB's replication/sync API and provides a reactive interface for monitoring sync progress.
 *
 * @template T - The type of values being synchronized, constrained to AllowedValue types
 * @param sync - The PouchDB sync object that emits synchronization events
 * @param parse_docs - Function to transform PouchDB documents into StorageItem objects
 * @returns An Observable that emits StateSyncEventType events for all sync activities
 *
 * @example
 * ```typescript
 * import { observePouchDbSync } from './state-sync-observer';
 * import { StateSyncEvent } from '../events';
 *
 * // Set up PouchDB sync
 * const sync = localDb.sync(remoteDb, { live: true, retry: true });
 *
 * // Create observer
 * const syncObserver = observePouchDbSync(
 *   sync,
 *   (doc) => ({ key: doc._id, value: doc.value })
 * );
 *
 * // Subscribe to sync events
 * const subscription = syncObserver.subscribe({
 *   next: (event) => {
 *     if (StateSyncEvent.Change.is(event)) {
 *       console.log(`Sync ${event.detail.direction}:`, event.detail.change);
 *     } else if (StateSyncEvent.Complete.is(event)) {
 *       console.log('Sync completed:', event.detail.result);
 *     } else if (StateSyncEvent.Error.is(event)) {
 *       console.error('Sync error:', event.detail.error);
 *     } else if (StateSyncEvent.Status.is(event)) {
 *       console.log(`Sync status: ${event.detail.status}`);
 *     }
 *   },
 *   error: (err) => console.error('Observer error:', err),
 *   complete: () => console.log('Sync observation complete')
 * });
 *
 * // Clean up when done
 * subscription.unsubscribe();
 * ```
 *
 * @remarks
 * The observer monitors these PouchDB sync events:
 * - `change`: Emitted when data changes are replicated
 * - `complete`: Emitted when sync operation finishes successfully
 * - `error`: Emitted when sync encounters an error
 * - `denied`: Emitted when sync is denied (treated as error)
 * - `paused`: Emitted when sync pauses (e.g., due to network issues)
 * - `active`: Emitted when sync becomes active again
 *
 * All events are converted to standardized StateSyncEvent types for consistent handling.
 *
 * @see {@link StateSyncEvent} for event type definitions
 * @see {@link StorageItem} for the expected document structure
 */
export function observePouchDbSync<T extends AllowedValue = AllowedValue>(
  sync: PouchDB.Replication.Sync<{ value: T }>,
  parse_docs: (doc: PouchDB.Core.ExistingDocument<{ value: T }>) => StorageItem<T>,
): Observable<StateSyncEventType<T>> {
  /**
   * Internal helper function to parse PouchDB replication results into standardized format.
   *
   * @param change - Raw PouchDB replication result from sync operation
   * @returns Parsed replication result with standardized structure and parsed documents
   */
  const parse_replication_result = (
    change: PouchDB.Replication.ReplicationResult<{ value: T }>,
  ) => ({
    items: change.docs.map(parse_docs),
    item_written: change.docs_written,
    item_read: change.docs_read,
    items_write_failures: change.doc_write_failures,
    start_time: change.start_time,
    ok: change.ok,
    errors: change.errors,
  });

  return new Observable<StateSyncEventType<T>>((subscriber) => {
    const onChange = (event: PouchDB.Replication.SyncResult<{ value: T }>) => {
      subscriber.next(
        new StateSyncEvent.Change<T>({
          detail: { direction: event.direction, change: parse_replication_result(event.change) },
        }),
      );
    };
    const onComplete = (event: PouchDB.Replication.SyncResultComplete<{ value: T }>) => {
      subscriber.next(
        new StateSyncEvent.Complete<T>({
          detail: {
            result: {
              pull: event.pull
                ? { ...parse_replication_result(event.pull), status: event.pull.status }
                : undefined,
              push: event.push
                ? { ...parse_replication_result(event.push), status: event.push.status }
                : undefined,
            },
          },
        }),
      );
    };
    const onError = (error: unknown) => {
      subscriber.next(new StateSyncEvent.Error({ detail: { type: 'error', error } }));
    };
    const onDenied = (error: unknown) => {
      subscriber.next(new StateSyncEvent.Error({ detail: { type: 'denied', error } }));
    };
    const onPaused = () => {
      subscriber.next(new StateSyncEvent.Status({ detail: { status: 'paused' } }));
    };
    const onActive = () => {
      subscriber.next(new StateSyncEvent.Status({ detail: { status: 'active' } }));
    };
    sync.on('change', onChange);
    sync.on('complete', onComplete);
    sync.on('error', onError);
    sync.on('denied', onDenied);
    sync.on('paused', onPaused);
    sync.on('active', onActive);
    return () => {
      sync.removeListener('change', onChange);
      sync.removeListener('complete', onComplete);
      sync.removeListener('error', onError);
      sync.removeListener('denied', onDenied);
      sync.removeListener('paused', onPaused);
      sync.removeListener('active', onActive);
    };
  });
}

export default observePouchDbSync;
