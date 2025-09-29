import { Observable } from 'rxjs';

import type { AllowedValue } from '../types.js';
import type { StorageItem } from './types.js';
import { type StateChangeEventType, StateChangeEvent, StateErrorEvent } from '../events/index.js';
import { StorageError } from './StorageError.js';

/**
 * Function signature for parsing a PouchDB document into a StorageItem.
 * Used to transform raw PouchDB documents into the internal storage format.
 *
 * @template T - The type of value stored in the document
 * @param doc - The PouchDB document with metadata from a changes feed
 * @returns A StorageItem containing the parsed key and value
 */
type ParseDocFn<T extends AllowedValue = AllowedValue> = (
  doc: PouchDB.Core.ExistingDocument<{ value: T }> & PouchDB.Core.ChangesMeta,
) => StorageItem<T>;

/**
 * Observes changes from a PouchDB changes feed and transforms them into state change events.
 *
 * This function creates an observable that monitors a PouchDB changes feed and emits
 * appropriate state change events (Created, Updated, Deleted) based on the type of
 * change detected. It also handles error events from the database.
 *
 * The function determines the type of change by examining the document's revision:
 * - Documents with revision starting with '1-' are considered newly created
 * - Documents with higher revision numbers are considered updated
 * - Deleted documents emit a Deleted event
 *
 * @template T - The type of value stored in the documents
 * @param changes - The PouchDB changes feed to observe
 * @param parse_docs - Function to parse PouchDB documents into StorageItems
 * @returns An observable that emits StateChangeEventType or StateErrorEvent
 *
 * @example
 * ```typescript
 * const changes = db.changes({ live: true, include_docs: true });
 * const parseDoc = (doc) => ({ key: doc._id, value: doc.value });
 * const changeObserver = observePouchDbChange(changes, parseDoc);
 *
 * changeObserver.subscribe({
 *   next: (event) => {
 *     if (event instanceof StateChangeEvent.Created) {
 *       console.log('Item created:', event.detail.key);
 *     } else if (event instanceof StateChangeEvent.Updated) {
 *       console.log('Item updated:', event.detail.key);
 *     } else if (event instanceof StateChangeEvent.Deleted) {
 *       console.log('Item deleted:', event.detail.key);
 *     } else if (event instanceof StateErrorEvent) {
 *       console.error('Error:', event.detail.error.message);
 *     }
 *   }
 * });
 * ```
 */
export function observePouchDbChange<T extends AllowedValue = AllowedValue>(
  changes: PouchDB.Core.Changes<{ value: T }>,
  parse_docs: ParseDocFn<T>,
): Observable<StateChangeEventType<T> | StateErrorEvent> {
  return new Observable<StateChangeEventType<T> | StateErrorEvent>((subscriber) => {
    const onChange = (change: PouchDB.Core.ChangesResponseChange<{ value: T }>) => {
      subscriber.next(mapChange(change, parse_docs));
    };
    const onError = (error: unknown) => {
      // Wrap PouchDB errors in our custom StorageError format
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      subscriber.next(
        new StateErrorEvent({
          detail: {
            error: new StorageError(`Database changes feed error: ${errorMessage}`, {
              cause: error instanceof Error ? error : new Error(String(error)),
              context: { originalError: error },
            }),
          },
        }),
      );
    };
    changes.on('change', onChange);
    changes.on('error', onError);
    return () => {
      changes.removeListener('change', onChange);
      changes.removeListener('error', onError);
    };
  });
}

const mapChange = <T extends AllowedValue = AllowedValue>(
  change: PouchDB.Core.ChangesResponseChange<{ value: T }>,
  parse_docs: ParseDocFn<T>,
): StateChangeEventType<T> | StateErrorEvent => {
  // Extract document and deletion flag from the change event
  const { doc, deleted } = change;

  // Handle case where document is missing (shouldn't happen in normal operation)
  if (!doc) {
    return new StateErrorEvent({
      detail: {
        error: new StorageError('Unexpected error: changeset is missing document', {
          cause: new Error('Document missing in change event'),
          context: { change },
        }),
      },
    });
  }

  // Parse the document into our internal StorageItem format
  const item = parse_docs(doc);

  // Create event detail object with document ID, key, and parsed item
  const detail = {
    _id: doc._id,
    key: item.key,
    item,
  };

  // Handle document deletion first
  if (deleted) {
    return new StateChangeEvent.Deleted({ detail });
  }

  // Determine if this is a creation or update
  // More reliable approach: check if revision starts with '1-'
  // Note: This is not 100% reliable for all PouchDB scenarios, but it's the best we have
  if (doc._rev.startsWith('1-')) {
    return new StateChangeEvent.Created({ detail });
  }

  // Document has been updated (revision > 1)
  return new StateChangeEvent.Updated({ detail });
};
