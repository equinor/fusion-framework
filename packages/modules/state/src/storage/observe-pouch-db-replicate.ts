import { Observable } from 'rxjs';
import type { AllowedValue } from '../types.js';
import type { StorageItem } from './types.js';
import { StateSyncEvent, type StateSyncEventType } from '../events/index.js';

/**
 * Observes a single-direction PouchDB replication (`db.replicate.to`/`db.replicate.from`) and
 * converts its events into the same `StateSyncEvent` shape used for bidirectional `db.sync()`.
 *
 * Unlike {@link observePouchDbSync}, the replication direction is fixed for the lifetime of the
 * observed stream rather than read off each change event, since a one-directional `Replication`
 * only ever reports changes for that direction.
 *
 * @template T - The type of values being replicated, constrained to AllowedValue types
 * @param replication - The PouchDB replication object (`replicate.to` or `replicate.from` result)
 * @param direction - Whether this replication pushes local changes out or pulls remote changes in
 * @param parse_docs - Function to transform PouchDB documents into StorageItem objects
 * @returns An Observable that emits StateSyncEventType events for this replication direction
 *
 * @example
 * ```typescript
 * const push = localDb.replicate.to(remoteDb, { live: true, retry: true });
 * const pushEvent$ = observePouchDbReplicate(push, 'push', (doc) => ({ key: doc._id, value: doc.value }));
 * ```
 */
export function observePouchDbReplicate<T extends AllowedValue = AllowedValue>(
  replication: PouchDB.Replication.Replication<{ value: T }>,
  direction: 'push' | 'pull',
  parse_docs: (doc: PouchDB.Core.ExistingDocument<{ value: T }>) => StorageItem<T>,
): Observable<StateSyncEventType<T>> {
  const parse_replication_result = (
    change: PouchDB.Replication.ReplicationResult<{ value: T }>,
  ) => ({
    // A cancelled (e.g. watchdog-forced) replication fires 'complete' with no `docs` at all.
    items: (change.docs ?? [])
      // Convert replicated documents to the storage item shape expected by state events.
      .map((doc) => parse_docs(doc)),
    item_written: change.docs_written,
    item_read: change.docs_read,
    items_write_failures: change.doc_write_failures,
    start_time: change.start_time,
    ok: change.ok,
    errors: change.errors,
  });

  return new Observable<StateSyncEventType<T>>((subscriber) => {
    const onChange = (change: PouchDB.Replication.ReplicationResult<{ value: T }>) => {
      subscriber.next(
        new StateSyncEvent.Change<T>({
          detail: { direction, change: parse_replication_result(change) },
        }),
      );
    };
    const onComplete = (change: PouchDB.Replication.ReplicationResultComplete<{ value: T }>) => {
      subscriber.next(
        new StateSyncEvent.Complete<T>({
          detail: {
            result: {
              [direction]: { ...parse_replication_result(change), status: change.status },
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
    replication.on('change', onChange);
    replication.on('complete', onComplete);
    replication.on('error', onError);
    replication.on('denied', onDenied);
    replication.on('paused', onPaused);
    replication.on('active', onActive);
    return () => {
      replication.removeListener('change', onChange);
      replication.removeListener('complete', onComplete);
      replication.removeListener('error', onError);
      replication.removeListener('denied', onDenied);
      replication.removeListener('paused', onPaused);
      replication.removeListener('active', onActive);
    };
  });
}

export default observePouchDbReplicate;
