import PouchDB from 'pouchdb';
import { type Observable, Subject, type SubscriptionLike } from 'rxjs';

import type { AllowedValue } from '../types.js';

import type { StorageItem, StorageResult } from './types.js';

import type {
  RetrievedItemsResponse,
  IStorage,
  RetrieveItemsOptions,
} from './Storage.interface.js';

import { StorageError } from './StorageError.js';

import { StateOperationEvent, type StateEventType } from '../events/index.js';
import { observePouchDbChange } from './observe-pouch-db-change.js';

const STORAGE_KEY_SEPARATOR = '::';
const CONFLICT_SCAN_PAGE_SIZE = 100;
const MAX_CONFLICT_RESOLUTION_ATTEMPTS = 3;
const MAX_CONFLICT_RESOLUTION_RETRY_CYCLES = 3;
const CONFLICT_RESOLUTION_RETRY_DELAY_MS = 250;
const MAX_BULK_DELETE_DOCUMENTS = 500;
const MAX_LOCAL_BULK_DELETE_PAYLOAD_BYTES = 1_000_000;

type PouchDbDeletionDocument = {
  _id: string;
  _rev: string;
  _deleted: true;
};

/**
 * Configuration options for PouchDbStorage instances.
 *
 * Extends PouchDB's database configuration with storage-specific options
 * for multi-tenancy and key management.
 *
 * @property key_prefix - Optional namespace prefix applied to all keys (e.g., 'tenant-123').
 *                        Enables logical separation in shared databases.
 */
export type PouchDbStorageOptions = PouchDB.Configuration.DatabaseConfiguration & {
  key_prefix?: string;
  /**
   * Number of old revisions to keep for each document.
   * Lower values reduce storage usage at the cost of revision history.
   */
  revs_limit?: number;
  /**
   * Maximum local database size in megabytes.
   * Important for Safari (IndexedDB quota enforcement).
   * Valid values: 10, 50, 100, 500, 1000.
   */
  size?: number;
};

/**
 * Type guard for PouchDB response discrimination.
 *
 * @param res - PouchDB operation response to test
 * @returns True if response contains error information
 */
function isPouchDbError(
  res: PouchDB.Core.Response | PouchDB.Core.Error,
): res is PouchDB.Core.Error {
  return !!(res as PouchDB.Core.Error).error;
}

/**
 * Reads a numeric HTTP-style status from a PouchDB error.
 * @param error - Value returned by a PouchDB operation.
 * @returns The PouchDB status code, when present.
 */
function getPouchDbErrorStatus(error: unknown): number | undefined {
  // PouchDB adapters expose status on error objects but may throw arbitrary values.
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined;
  }
  return typeof error.status === 'number' ? error.status : undefined;
}

/**
 * Reads the current live conflict leaves from a PouchDB document.
 * @param document - Document returned with conflict metadata enabled.
 * @returns Conflicting leaf revisions, excluding malformed metadata.
 */
function getConflictingRevisions(document: object): string[] {
  // Avoid trusting adapter metadata until it has the string shape used by revision APIs.
  if (!('_conflicts' in document) || !Array.isArray(document._conflicts)) {
    return [];
  }
  const revisions: unknown[] = document._conflicts;
  // Ignore malformed conflict metadata rather than passing it to a write operation.
  return revisions.filter((revision): revision is string => typeof revision === 'string');
}

/**
 * Identifies revisions that became stale while a conflict-resolution pass was running.
 * @param error - Value returned by a PouchDB operation.
 * @returns True when the current revision tree should be fetched and retried.
 */
function isRetryablePouchDbError(error: unknown): boolean {
  const status = getPouchDbErrorStatus(error);
  return status === 404 || status === 409;
}

/**
 * Event-driven key-value storage implementation using PouchDB.
 *
 * Provides reactive storage with real-time change tracking, key prefixing for multi-tenancy,
 * and comprehensive backup/restore capabilities. All operations are atomic and emit detailed events.
 *
 * Key Features:
 * - Reactive change tracking via RxJS observables
 * - Automatic key prefixing for tenant isolation
 * - Bulk operations for performance
 * - JSON-based backup/restore
 * - Conflict resolution and error handling
 *
 * @example
 * ```typescript
 * const storage = new PouchDbStorage('app-db', { key_prefix: 'tenant-1' });
 * await storage.initialize();
 *
 * storage.events$.subscribe(event => console.log(event.type));
 * await storage.putItem({ key: 'config', value: { theme: 'dark' } });
 * ```
 *
 * @see {@link IStorage} for the complete interface specification
 * @see {@link https://pouchdb.com/} for underlying database documentation
 */
export class PouchDbStorage implements IStorage, Disposable {
  // Core storage instance - handles all PouchDB operations
  #db: PouchDB.Database;

  // Optional prefix for namespacing keys (e.g., 'tenant-123::user.profile')
  #key_prefix?: string;

  // Unified event stream for all storage operations and state changes
  #events: Subject<StateEventType> = new Subject();

  // Array of cleanup functions to call when the instance is disposed
  // Ensures proper resource cleanup and prevents memory leaks
  #teardown: Array<VoidFunction> = [this.#events.complete.bind(this.#events)];

  // Guards `initialize()` so a caller re-invoking it (the public method is documented as
  // safe to call repeatedly) can't pile up duplicate change-feed subscriptions or syncs.
  #initialized = false;

  // Avoid concurrent cleanup writes for the same document while still scheduling a follow-up
  // pass when replication adds another leaf during an active resolution.
  #conflictResolutions = new Map<string, Promise<void>>();
  #pendingConflictResolutions = new Set<string>();
  #conflictRetryTimers = new Map<
    string,
    { timer: ReturnType<typeof setTimeout>; resolve: VoidFunction }
  >();
  #disposed = false;

  /**
   * Static factory method for creating PouchDB instances.
   * Useful for testing or when you need to configure the database before creating storage.
   * @param name - Database name.
   * @param options - PouchDB database options.
   * @returns A configured PouchDB database instance.
   */
  public static CreateDb(
    name: string,
    options?: PouchDB.Configuration.DatabaseConfiguration,
  ): PouchDB.Database {
    return new PouchDB(name, options);
  }

  /**
   * Returns the underlying PouchDB database for subclasses.
   * @returns The underlying PouchDB database.
   */
  protected get _db(): PouchDB.Database {
    return this.#db;
  }

  /**
   * Observable stream of all storage events for reactive change tracking.
   *
   * Emits events for storage operations, state changes, and errors. Use RxJS operators
   * to filter and transform event streams for specific use cases.
   *
   * @returns RxJS Observable emitting StorageEvent instances
   *
   * @example
   * ```typescript
   * storage.events$
   *   .pipe(filter(event => event.type?.startsWith('onStorageChange')))
   *   .subscribe(event => handleChange(event.detail.item));
   * ```
   *
   * @remarks
   * - Events only emit after `initialize()` is called
   * - Includes operation metrics and error details
   * - Memory usage scales with event frequency
   */
  public get events$(): Observable<StateEventType> {
    return this.#events.asObservable();
  }

  /**
   * Registers a cleanup operation and returns its deregistration function.
   * @param fn - Cleanup callback or subscription to register.
   * @returns A function that removes the cleanup operation.
   */
  protected _addTeardown(fn: VoidFunction | SubscriptionLike): VoidFunction {
    const teardown = () => {
      typeof fn === 'function' ? fn() : fn.unsubscribe();
    };
    this.#teardown.push(teardown);
    return () => this.#teardown.splice(this.#teardown.indexOf(teardown), 1);
  }

  /**
   * Emits a storage event to all active observers.
   * @param event - Event to publish.
   */
  protected _emitEvent(event: StateEventType): void {
    this.#events.next(event);
  }

  /**
   * Generates prefixed storage key for namespacing.
   *
   * @internal
   * @protected
   * @param key - Base storage key
   * @returns Prefixed key if key_prefix configured, otherwise original key
   */
  protected _generateKey(key?: string): string {
    // If no key prefix is configured, return the key as-is (or empty string if undefined)
    if (!this.#key_prefix) {
      return key ?? '';
    }

    // Prefix format: "prefix::key" (e.g., "tenant-123::user.profile")
    // This allows for efficient querying and namespacing
    return `${this.#key_prefix}${STORAGE_KEY_SEPARATOR}${key ?? ''}`;
  }

  /**
   * Extracts user key from prefixed document ID.
   *
   * @internal
   * @protected
   * @param id - Prefixed document identifier
   * @returns User-facing key with prefix removed, or original if no prefix match
   */
  protected _extractKey(id: string): string {
    // If no key prefix is configured, return the id as-is
    if (!this.#key_prefix) {
      return id;
    }

    // Split the id by separator and validate the prefix
    const [prefix, key] = id.split(STORAGE_KEY_SEPARATOR);

    // Validate that the prefix matches our configured prefix and key exists
    // Return empty string if validation fails (invalid prefixed key)
    if (prefix !== this.#key_prefix || !key) {
      return '';
    }

    // Return the extracted key (the part after the prefix)
    return key;
  }

  /**
   * Creates PouchDbStorage instance with specified database and configuration.
   *
   * @param name_or_instance - Database name string or existing PouchDB instance
   * @param options - Storage configuration options
   *
   * @example
   * ```typescript
   * const storage = new PouchDbStorage('app-db', { key_prefix: 'tenant-1' });
   * ```
   *
   * @remarks
   * - String names create new PouchDB instances with auto-compaction
   * - Existing instances should be pre-configured
   * - key_prefix enables logical data separation
   */
  constructor(name_or_instance: string | PouchDB.Database, options?: PouchDbStorageOptions) {
    // Extract key_prefix from options and keep remaining DB options
    const { key_prefix, ...db_options } = options ?? {};

    // Store the key prefix for namespacing (undefined if not provided)
    this.#key_prefix = key_prefix;

    // A replayable event stream may be introduced when retention requirements are defined.

    // Create new PouchDB instance if a string is provided, otherwise use existing instance
    if (typeof name_or_instance === 'string') {
      this.#db = new PouchDB(name_or_instance, {
        auto_compaction: true, // Critical for performance - prevents DB bloat
        ...db_options, // Apply any additional PouchDB configuration
      });
    } else {
      // Use existing PouchDB instance (useful for testing or shared databases)
      this.#db = name_or_instance;
    }
  }

  /**
   * Initializes storage and establishes live change tracking.
   *
   * Must be called before storage operations begin. Sets up change feed subscription
   * and enables event emission for subsequent operations.
   *
   * @throws {StorageError} On initialization failure
   * @sealed
   * @remarks
   * - Idempotent - safe to call multiple times
   * - Only tracks changes after initialization
   * - Call `allItems()` to get existing data
   */
  public async initialize(): Promise<void> {
    // subsequent calls are a no-op, per this method's documented idempotency contract.
    if (this.#initialized) {
      return;
    }
    this.#initialized = true;
    try {
      this._initialize();
    } catch (error) {
      // Emit failure event if initialization fails
      // This allows subscribers to handle initialization errors gracefully
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: {
            fn: 'initialize',
            error: new StorageError('Failed to initialize storage', { cause: error }),
          },
        }),
      );
    }
  }

  /** Starts the live PouchDB change feed used to emit state events. */
  protected _initialize(): void {
    // Subscribe to live changes in the PouchDB database
    // This creates a persistent connection that will emit events for any future changes
    const changes = this.#db.changes<{ value: AllowedValue }>({
      since: 'now', // Start from current state (not historical changes)
      live: true, // Keep connection alive for real-time updates
      include_docs: true, // Include full document data in change events
      conflicts: true,
      filter: (doc) => {
        // Only process documents that match our key prefix (if configured)
        // This ensures we don't emit events for documents outside our namespace
        if (this.#key_prefix) {
          return doc._id.startsWith(this._generateKey(''));
        }
        return true; // No prefix = process all documents
      },
    });

    // Live sync can introduce a losing leaf after the storage instance has started.
    changes.on('change', (change) => {
      // Start cleanup only for changes that actually carry live conflict metadata.
      if (change.doc && getConflictingRevisions(change.doc).length > 0) {
        void this.#resolveConflicts(change.id).catch((error) =>
          this.#reportConflictResolutionFailure(change.id, error),
        );
      }
    });

    const event$ = observePouchDbChange(changes, (doc) => ({
      _id: doc._id,
      key: this._extractKey(doc._id),
      value: doc.value,
    }));

    const subscription = event$.subscribe({
      next: (event) => this.#events.next(event as StateEventType),
    });
    subscription.add(() => changes.cancel());

    this.#teardown.push(() => subscription.unsubscribe());

    // Existing local conflicts predate the live feed's `since: 'now'` checkpoint.
    void this.#scanExistingConflicts().catch((error) =>
      this.#reportConflictResolutionFailure('startup-scan', error),
    );
  }

  /**
   * Scans existing state documents in small pages so migration work does not block sync startup.
   * @returns Resolves after every currently active document has been checked.
   */
  async #scanExistingConflicts(): Promise<void> {
    let startkey: string | undefined = this.#key_prefix ? this._generateKey('') : undefined;
    let cursor: string | undefined;

    // Continue paginating until exhausted, yielding through async database reads between pages.
    while (!this.#disposed) {
      // Combine the current inclusive cursor with the scoped upper bound for this page.
      const response = await this.#db.allDocs<{ value: AllowedValue }>({
        include_docs: true,
        conflicts: true,
        limit: CONFLICT_SCAN_PAGE_SIZE,
        ...(startkey !== undefined ? { startkey } : {}),
        ...(this.#key_prefix ? { endkey: this._generateKey('\ufff0') } : {}),
      });

      // Resolve serially so a conflict-heavy page cannot fan out an unbounded number of writes.
      for (const row of response.rows) {
        // allDocs includes startkey when it exists; skip only that exact row, not its successor.
        if (row.id === cursor) {
          // Discard only the cursor row that this inclusive page returned.
          continue;
        }
        // Disposal can happen while an earlier row is resolving, so stop before starting more I/O.
        if (this.#disposed) {
          return;
        }
        // Skip deleted rows, error rows and ordinary documents without conflict leaves.
        if ('error' in row || !row.doc || getConflictingRevisions(row.doc).length === 0) {
          // This row cannot produce conflict cleanup work.
          continue;
        }
        try {
          await this.#resolveConflicts(row.id);
        } catch (error) {
          this.#reportConflictResolutionFailure(row.id, error);
        }
      }

      const lastRow = response.rows.at(-1);
      // A short page or missing cursor means the range has been completely scanned.
      if (response.rows.length < CONFLICT_SCAN_PAGE_SIZE || !lastRow) {
        return;
      }
      startkey = lastRow.id;
      cursor = lastRow.id;
    }
  }

  /**
   * Removes losing leaves while preserving the database's current winning revision.
   * @param id - Full PouchDB document ID.
   * @returns Resolves when no live conflict leaves remain.
   */
  async #resolveConflicts(id: string): Promise<void> {
    // Disposed storage must not schedule new cleanup work.
    if (this.#disposed) {
      return;
    }
    const activeResolution = this.#conflictResolutions.get(id);
    // Coalesce duplicate events and remember that a later pass may be needed.
    if (activeResolution) {
      this.#pendingConflictResolutions.add(id);
      return activeResolution;
    }

    const resolution = this.#resolveConflictsUntilStable(id).finally(() => {
      this.#conflictResolutions.delete(id);
      this.#pendingConflictResolutions.delete(id);
    });
    this.#conflictResolutions.set(id, resolution);
    return resolution;
  }

  /**
   * Rechecks a document after each write so replication races are handled using fresh leaves.
   * @param id - Full PouchDB document ID.
   * @returns Resolves when the document is stable or the storage is disposed.
   * @throws {StorageError} When repeated no-progress races exhaust the retry budget.
   */
  async #resolveConflictsUntilStable(id: string): Promise<void> {
    let raceAttempts = 0;
    let retryCycles = 0;
    // Re-fetch after each batch so successful work can continue and races use fresh revisions.
    while (!this.#disposed) {
      this.#pendingConflictResolutions.delete(id);
      const result = await this.#resolveConflictPass(id);
      // A disposal during database I/O ends the pass without scheduling retries.
      if (this.#disposed) {
        return;
      }
      // A queued change event requires another read even when the previous pass looked stable.
      if (result === 'stable' && !this.#pendingConflictResolutions.has(id)) {
        return;
      }
      // Only consecutive no-progress batches consume the race budget.
      if (result === 'retry') {
        raceAttempts += 1;
        // Back off only after fresh reads confirm that conflicts still remain.
        if (raceAttempts >= MAX_CONFLICT_RESOLUTION_ATTEMPTS) {
          const remaining = await this.#getConflictDocument(id);
          // A concurrent resolver or deletion may have already drained the conflict set.
          if (this.#disposed || !remaining || getConflictingRevisions(remaining).length === 0) {
            return;
          }
          // Surface persistent races rather than silently abandoning unresolved leaves.
          if (retryCycles >= MAX_CONFLICT_RESOLUTION_RETRY_CYCLES) {
            throw new StorageError(
              `Conflict resolution made no progress after ${retryCycles + 1} retry cycles for ${id}`,
            );
          }
          retryCycles += 1;
          raceAttempts = 0;
          await this.#waitForConflictResolutionRetry(
            id,
            CONFLICT_RESOLUTION_RETRY_DELAY_MS * 2 ** (retryCycles - 1),
          );
          // Re-fetch after backoff instead of spinning on a stale revision tree.
          continue;
        }
      } else {
        // Any actual progress resets the race cycle because the next batch has fresh state.
        raceAttempts = 0;
        // Successful progress starts a fresh retry budget if a later concurrent write races.
        if (result === 'progress') {
          retryCycles = 0;
        }
      }

      // Yield between batches so large documents do not monopolize the event loop.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  /**
   * Delays another bounded conflict-resolution cycle and allows disposal to cancel it.
   * @param id - Full PouchDB document ID.
   * @param delayMs - Backoff delay before rechecking the document.
   */
  async #waitForConflictResolutionRetry(id: string, delayMs: number): Promise<void> {
    // Do not register timers once teardown has started.
    if (this.#disposed) {
      return;
    }
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        this.#conflictRetryTimers.delete(id);
        resolve();
      }, delayMs);
      this.#conflictRetryTimers.set(id, { timer, resolve });
    });
  }

  /**
   * Deletes one bounded batch of losing leaves using the latest winner.
   * @param id - Full PouchDB document ID.
   * @returns Whether cleanup made progress, needs a race retry, or is stable.
   */
  async #resolveConflictPass(id: string): Promise<'stable' | 'progress' | 'retry'> {
    const document = await this.#getConflictDocument(id);
    // A missing document or disposal leaves nothing safe to resolve.
    if (!document || this.#disposed) {
      return 'stable';
    }
    // The winner is never tombstoned by conflict cleanup.
    const conflicts = getConflictingRevisions(document).filter(
      (revision) => revision !== document._rev,
    );
    // No losing leaves means the current revision tree is stable.
    if (conflicts.length === 0) {
      return 'stable';
    }
    const deleted = await this.#deleteRevisions(id, conflicts.slice(0, MAX_BULK_DELETE_DOCUMENTS));
    // A zero-success batch indicates a race; successful batches continue in a later pass.
    return deleted > 0 ? 'progress' : 'retry';
  }

  /**
   * Fetches winner and conflict metadata, including a tombstoned winner for deletion recovery.
   * @param id - Full PouchDB document ID.
   * @returns The current document, or null when no revision exists.
   * @throws {Error} When the database read fails for a reason other than a missing document.
   */
  async #getConflictDocument(
    id: string,
  ): Promise<PouchDB.Core.ExistingDocument<{ value: AllowedValue }> | null> {
    try {
      return await this.#db.get<{ value: AllowedValue }>(id, {
        conflicts: true,
      });
    } catch (error) {
      // A 404 is expected after a concurrent delete; other failures must remain visible.
      if (getPouchDbErrorStatus(error) === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Writes tombstones for a set of leaf revisions and reports non-race failures.
   * @param id - Full PouchDB document ID.
   * @param revisions - Leaf revisions to tombstone.
   * @returns Number of revisions successfully tombstoned.
   * @throws {StorageError} When PouchDB reports a non-retryable deletion failure.
   */
  async #deleteRevisions(id: string, revisions: string[]): Promise<number> {
    // Tombstones target only these losing leaves, never the current winner.
    const results = await this.#bulkDeleteDocuments(
      revisions.map((_rev) => ({ _id: id, _rev, _deleted: true })),
    );
    // Inspect each result because bulkDocs can partially fail without rejecting.
    const failures = results.filter(isPouchDbError);
    // Conflicts and missing revisions are refreshed by the caller; permanent errors are surfaced.
    const permanentFailures = failures.filter((failure) => !isRetryablePouchDbError(failure));
    // Retryable races are refreshed by the caller; permanent errors must escape this pass.
    if (permanentFailures.length > 0) {
      throw new StorageError(`Failed to delete revisions for ${id}`, {
        cause: new AggregateError(
          permanentFailures,
          `PouchDB could not delete revisions for ${id}`,
        ),
      });
    }
    return results.length - failures.length;
  }

  /**
   * Sends tombstones in bounded local bulkDocs calls.
   * Sequential batches keep repeated revisions for one document ordered and race-visible.
   * @param deletions - Leaf revisions to tombstone.
   * @returns PouchDB results for every submitted revision.
   * @throws {StorageError} When a deletion cannot fit the local payload limit or bulkDocs rejects.
   */
  async #bulkDeleteDocuments(
    deletions: PouchDbDeletionDocument[],
  ): Promise<Array<PouchDB.Core.Response | PouchDB.Core.Error>> {
    const results: Array<PouchDB.Core.Response | PouchDB.Core.Error> = [];
    const encoder = new TextEncoder();
    let offset = 0;

    // Split local bulkDocs calls by count and serialized local document size.
    while (offset < deletions.length) {
      const batch: PouchDbDeletionDocument[] = [];
      let payloadBytes = 1_024;
      // Stop before crossing either local limit; advance only after adding a deletion.
      while (offset < deletions.length && batch.length < MAX_BULK_DELETE_DOCUMENTS) {
        const deletion = deletions[offset];
        const deletionBytes =
          encoder.encode(JSON.stringify(deletion)).byteLength + (batch.length > 0 ? 1 : 0);
        // A single oversized tombstone cannot be made safe by splitting the batch.
        if (payloadBytes + deletionBytes > MAX_LOCAL_BULK_DELETE_PAYLOAD_BYTES) {
          // Fail rather than submit a batch that violates the local payload bound.
          if (batch.length === 0) {
            throw new StorageError('A deletion document exceeds the maximum bulk request size');
          }
          // The next outer batch starts at the same offset with an empty payload.
          break;
        }
        batch.push(deletion);
        payloadBytes += deletionBytes;
        offset += 1;
      }

      // Sequential submission keeps batches for the same document race-visible.
      results.push(...(await this.#db.bulkDocs(batch)));
    }

    return results;
  }

  /**
   * Deletes every live leaf for one item, retrying when concurrent sync changes its revisions.
   * @param id - Full PouchDB document ID.
   * @returns Resolves when no live leaf remains.
   * @throws {StorageError} When live revisions remain after bounded retries.
   */
  async #removeLiveLeaves(id: string): Promise<void> {
    // Each retry re-reads the tree so a concurrent replication update cannot hide new leaves.
    for (let attempt = 0; attempt < MAX_CONFLICT_RESOLUTION_ATTEMPTS; attempt++) {
      const document = await this.#getConflictDocument(id);
      // The document may have disappeared while deletion was in flight.
      if (!document) {
        return;
      }

      const revisions = new Set(getConflictingRevisions(document));
      // Tombstone the winner only while it is live; deleted winner revisions are preserved.
      if (!('_deleted' in document) || document._deleted !== true) {
        revisions.add(document._rev);
      }
      // No live revision remains to delete.
      if (revisions.size === 0) {
        return;
      }
      await this.#deleteRevisions(id, [...revisions]);
    }

    const remaining = await this.#getConflictDocument(id);
    // Confirm the retry budget actually removed every live leaf before reporting success.
    if (
      remaining &&
      (!('_deleted' in remaining) ||
        remaining._deleted !== true ||
        getConflictingRevisions(remaining).length > 0)
    ) {
      throw new StorageError(`Failed to remove every live revision for ${id}`);
    }
  }

  /**
   * Deletes items by tombstoning every current live leaf and normalizes per-document failures.
   * @param ids - Unique full PouchDB document IDs to remove.
   * @returns One storage result for each requested document ID.
   * @throws {StorageError} When bulk deletion fails without a document identifier.
   */
  async #removeDocuments(ids: string[]): Promise<StorageResult[]> {
    // Avoid unnecessary reads and preserve the empty-input contract.
    if (ids.length === 0) {
      return [];
    }

    const response = await this.#db.allDocs<{ value: AllowedValue }>({
      keys: ids,
      include_docs: true,
      conflicts: true,
    });
    const conflictedIds = new Set<string>();
    // Expand each row into tombstones for all currently known live leaves.
    const deletions: PouchDbDeletionDocument[] = response.rows.flatMap((row) => {
      // Missing/error rows have no revision that can be safely tombstoned.
      if ('error' in row || !row.doc) {
        return [];
      }
      const conflicts = getConflictingRevisions(row.doc);
      // Re-read conflicted documents after the bulk attempt to catch revision races.
      if (conflicts.length > 0) {
        conflictedIds.add(row.id);
      }
      const revisions = new Set(conflicts);
      // Include the winner only when it remains a live revision.
      if (!('_deleted' in row.doc) || row.doc._deleted !== true) {
        revisions.add(row.doc._rev);
      }
      // Emit one tombstone for each distinct known live leaf of this document.
      return [...revisions].map((_rev) => ({ _id: row.id, _rev, _deleted: true }));
    });

    // Do not call bulkDocs for empty or fully deleted ranges.
    const bulkResults = deletions.length > 0 ? await this.#bulkDeleteDocuments(deletions) : [];
    const retryIds = conflictedIds;
    // Inspect failed per-document results and schedule a fresh read for affected IDs.
    for (const result of bulkResults) {
      // Successful writes need no retry.
      if (!isPouchDbError(result)) {
        // Only failed rows need a fresh conflict-tree read.
        continue;
      }
      // A failure without an ID cannot be attributed to an item result.
      if (!result.id) {
        throw new StorageError('PouchDB returned a deletion failure without a document ID', {
          cause: result,
        });
      }
      retryIds.add(result.id);
    }

    const retryIdsToRun = [...retryIds];
    // Retry each affected document independently so one race does not hide others.
    const retryResults = await Promise.all(
      retryIdsToRun.map(async (id): Promise<[string, StorageError | undefined]> => {
        try {
          await this.#removeLiveLeaves(id);
          return [id, undefined];
        } catch (cause) {
          return [id, new StorageError(`Failed to remove item ${id}`, { cause })];
        }
      }),
    );
    const retryErrors = new Map(retryResults);

    // Return results in caller order, including IDs that did not need a retry.
    return ids.map((id) => {
      const error = retryErrors.get(id);
      return error ? { status: 'error', key: id, error } : { status: 'success', key: id };
    });
  }

  /**
   * Publishes internal cleanup failures through the storage event stream.
   * @param id - Document ID or scan label associated with the failure.
   * @param cause - Original cleanup failure.
   */
  #reportConflictResolutionFailure(id: string, cause: unknown): void {
    // Disposal closes the event stream; do not emit late asynchronous failures afterward.
    if (this.#disposed) {
      return;
    }
    this.#events.next(
      new StateOperationEvent.Failure({
        source: this,
        detail: {
          fn: 'resolveConflicts',
          args: [id],
          error: new StorageError(`Failed to resolve conflicting revisions for ${id}`, { cause }),
        },
      }),
    );
  }

  /**
   * Bulk deletes all items from storage with optional scope control.
   *
   * @param args - Clear operation configuration
   * @param args.clear_all - If true, deletes ALL items regardless of key prefix; if false, only deletes prefixed items
   * @returns Array of StorageResult objects for each deletion attempt
   *
   * @example
   * ```typescript
   * const results = await storage.clear({ clear_all: false });
   * console.log(`Deleted ${results.length} items`);
   * ```
   *
   * @remarks
   * - **DANGER**: `clear_all: true` removes ALL data from database
   * - With key_prefix, `clear_all: false` only removes prefixed items
   * - Performance: O(n) where n = documents to delete
   * - Uses bulk operations for efficiency
   * - Emits events for monitoring
   *
   * @throws {StorageError} On network issues, permissions, or bulk deletion failures
   */
  public async clear(args: { clear_all: boolean }): Promise<StorageResult[]> {
    const start = performance.now();

    // Retrieve all documents based on scope settings
    // ignore_scope: true means clear ALL documents (dangerous!)
    // ignore_scope: false means only clear documents matching our key prefix
    const allDocs = await this._allItems({ ignore_scope: args.clear_all }).catch((e) => {
      const error = new StorageError('Failed to retrieve all items', { cause: e });
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'clear', args: [args], error },
        }),
      );
      throw error;
    });

    // Early return if no documents found - saves unnecessary bulk operation
    if (!allDocs.rows.length) {
      this.#events.next(
        new StateOperationEvent.Success({
          source: this,
          detail: {
            fn: 'clear',
            args: [args],
            message: 'No documents found, nothing to clear',
            metric: performance.now() - start,
          },
        }),
      );
      return [];
    }

    // Re-fetch leaf revisions for every selected ID because allDocs exposes only the winner
    // unless conflict metadata is requested; deletion must tombstone every live branch.
    const results = await this.#removeDocuments(allDocs.rows.map((row) => row.id)).catch((e) => {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError('Failed to clear items', { cause: e });
      // Emit failure event for monitoring
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'clear', args: [args], error },
        }),
      );
      throw error;
    });

    // Emit success event with operation details
    this.#events.next(
      new StateOperationEvent.Success({
        source: this,
        detail: {
          fn: 'clear',
          args: [args],
          metric: performance.now() - start,
        },
      }),
    );
    return results;
  }

  /**
   * Retrieves single item by key with type safety.
   *
   * @template T - Expected value type extending AllowedValue
   * @param key - Storage key to retrieve
   * @returns Storage item with key and value, or null if not found
   *
   * @example
   * ```typescript
   * const profile = await storage.item<UserProfile>('user.profile');
   * if (profile) console.log('Found:', profile.value);
   * ```
   *
   * @remarks
   * - Returns null for non-existent keys (safe for optional data)
   * - Keys are automatically prefixed if configured
   * - Performance: O(1) for individual document retrieval
   * - Type parameter enables TypeScript inference
   *
   * @throws {StorageError} On network issues, permissions, or document retrieval failures
   */
  public async item<T extends AllowedValue>(key: string): Promise<StorageItem<T> | null> {
    const start = performance.now();
    try {
      const id = this._generateKey(key);
      const entry = await this.#db.get<{ value: T }>(id);
      const result = {
        key: this._extractKey(entry._id),
        value: entry.value,
      };
      this.#events.next(
        new StateOperationEvent.Success({
          source: this,
          detail: {
            fn: 'item',
            args: [key],
            result,
            metric: performance.now() - start,
          },
        }),
      );
      return result;
    } catch (e) {
      // Treat a missing document as an ordinary null lookup result.
      if ((e as PouchDB.Core.Error).status === 404) {
        const result = null;
        this.#events.next(
          new StateOperationEvent.Failure({
            source: this,
            detail: {
              fn: 'item',
              args: [key],
              metric: performance.now() - start,
              error: new StorageError('Item not found'),
            },
          }),
        );
        return result;
      }
      const error = new StorageError(`Failed to get item ${key}`, { cause: e });
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'item', args: [key], error },
        }),
      );
      throw error;
    }
  }

  /**
   * Retrieves all items with optional filtering and pagination.
   *
   * @template T - Expected value type extending AllowedValue
   * @param options - Pagination and filtering options
   * @returns Paginated response with items and metadata
   *
   * @example
   * ```typescript
   * const response = await storage.allItems({ limit: 10, prefix: 'user.' });
   * console.log(`Found ${response.total_count} items`);
   * ```
   *
   * @remarks
   * - Use pagination for datasets >1000 items
   * - Prefix filtering leverages database indexes for O(log n) performance
   * - Memory usage: O(limit) for paginated results
   * - Keys are automatically un-prefixed in results
   * - total_count reflects all matching items, not just returned page
   *
   * @throws {StorageError} On network issues, permissions, or query execution failures
   */
  public async allItems<T extends AllowedValue>(
    options?: RetrieveItemsOptions,
  ): Promise<RetrievedItemsResponse<T>> {
    const { limit, skip, prefix } = options || {};

    // Guard: prefix must not contain the STORAGE_KEY_SEPARATOR
    if (prefix?.includes(STORAGE_KEY_SEPARATOR)) {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError(
        `Prefix option must not contain the storage key separator "${STORAGE_KEY_SEPARATOR}". Received: "${prefix}"`,
      );
      // Emit failure event for monitoring
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'allItems', args: [options], error },
        }),
      );
      // Re-throw to maintain promise rejection semantics
      throw error;
    }

    try {
      const start = performance.now();
      // Execute the allDocs query
      // PouchDB's allDocs method is much more efficient than individual operations
      const response = await this._allItems<T>({ include_docs: true, limit, skip, prefix });
      // Filter out rows that don't have a doc property - results must have value
      const items = response.rows
        .filter((row): row is typeof row & { doc: { value: T } } => !!row.doc)
        .map((row) => ({
          key: this._extractKey(row.id),
          value: row.doc.value,
        }));
      // Build the result object
      const result = {
        offset: response.offset ?? 0,
        total_count: response.total_rows,
        items,
      };
      // Emit success event with operation details
      this.#events.next(
        new StateOperationEvent.Success({
          source: this,
          detail: { fn: 'allItems', args: [options], result, metric: performance.now() - start },
        }),
      );
      return result;
    } catch (cause) {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError('Failed to retrieve all items', { cause });
      // Emit failure event for monitoring
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'allItems', args: [options], error },
        }),
      );
      // Re-throw to maintain promise rejection semantics
      throw error;
    }
  }

  /**
   * Stores or updates single item with conflict resolution.
   *
   * @param item - Storage item containing key and value
   * @returns StorageResult indicating operation success or failure
   *
   * @example
   * ```typescript
   * const result = await storage.putItem({
   *   key: 'user.profile',
   *   value: { name: 'John', preferences: { theme: 'dark' } }
   * });
   * ```
   *
   * @remarks
   * - Automatically handles create vs update operations
   * - Keys are automatically prefixed if configured
   * - PouchDB provides automatic conflict resolution
   * - Performance: O(1) for single document operations
   * - Emits events for reactive updates
   *
   * @throws {StorageError} On network issues, permissions, disk space, or conflict resolution failures
   */
  public async putItem(item: StorageItem): Promise<StorageResult> {
    try {
      const start = performance.now();
      const key = this._generateKey(item.key); // Apply key prefix if configured

      // Try to get existing document for update, fallback to creation template
      // This pattern handles both create and update operations seamlessly
      const existingDoc = await this.#db.get(key).catch((_e) => {
        // Document doesn't exist - create template for new document
        // _rev: undefined tells PouchDB this is a new document
        return { _id: key, _rev: undefined };
      });

      // Perform the put operation - PouchDB handles create vs update automatically
      // based on whether _rev is provided (existing) or undefined (new)
      const update = await this.#db.put({ ...existingDoc, value: item.value });

      // Resolve any pre-existing losing leaves even when the live change feed is not initialized.
      void this.#resolveConflicts(key).catch((error) =>
        this.#reportConflictResolutionFailure(key, error),
      );

      // Build result based on PouchDB response
      const result: StorageResult = update.ok
        ? {
            status: 'success',
            key: update.id, // Return the actual document ID (may include prefix)
          }
        : {
            status: 'error',
            key: update.id,
            error: new Error('Invalid result', { cause: update }),
          };

      // Emit success event with operation details and performance metrics
      this.#events.next(
        new StateOperationEvent.Success({
          source: this,
          detail: { fn: 'putItem', args: [item], result, metric: performance.now() - start },
        }),
      );
      return result;
    } catch (e) {
      // Wrap any database errors in our custom StorageError for consistency
      const error = new StorageError(`Failed to put item ${item.key}`, { cause: e });

      // Emit failure event so subscribers can handle the error
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'putItem', args: [item], error },
        }),
      );

      // Re-throw to maintain promise rejection semantics
      throw error;
    }
  }

  /**
   * Bulk stores multiple items in single atomic operation.
   *
   * @param items - Array of storage items to store or update
   * @returns Array of StorageResult objects (one per item)
   *
   * @example
   * ```typescript
   * const results = await storage.putItems([
   *   { key: 'user.name', value: 'John' },
   *   { key: 'user.settings', value: { theme: 'dark' } }
   * ]);
   * ```
   *
   * @remarks
   * - More efficient than individual putItem() calls
   * - Atomic operation with possible partial failures
   * - Keys are automatically prefixed if configured
   * - Performance: O(n) where n = item count
   * - Optimal batch size: 100-500 items for best performance
   *
   * @throws {StorageError} On network issues, permissions, or partial bulk operation failures
   */
  public async putItems(items: StorageItem[]): Promise<StorageResult[]> {
    try {
      const start = performance.now();
      // Execute the bulk operation
      // PouchDB's bulkDocs method is much more efficient than individual operations
      const result = await this._executeBulk(
        items.map((item) => ({
          _id: this._generateKey(item.key),
          value: item.value,
        })),
      );
      // Direct bulk writers may run before initialize() has installed the conflict-aware feed.
      for (const [index, outcome] of result.entries()) {
        const item = items[index];
        // Only successful writes can have introduced or extended conflicts.
        if (item && outcome.status === 'success') {
          const key = this._generateKey(item.key);
          void this.#resolveConflicts(key).catch((error) =>
            this.#reportConflictResolutionFailure(key, error),
          );
        }
      }
      // Emit success event with operation statistics
      this.#events.next(
        new StateOperationEvent.Success({
          source: this,
          detail: { fn: 'putItems', args: [items], result, metric: performance.now() - start },
        }),
      );
      return result;
    } catch (cause) {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError('Failed to put items', { cause });
      // Emit failure event for monitoring
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'putItems', args: [items], error },
        }),
      );
      // Re-throw to maintain promise rejection semantics
      throw error;
    }
  }

  /**
   * Removes single item by key with idempotent behavior.
   *
   * @param item - Object containing key to remove
   * @returns StorageResult indicating operation success or failure
   *
   * @example
   * ```typescript
   * const result = await storage.removeItem({ key: 'user.session' });
   * ```
   *
   * @remarks
   * - Idempotent - safe to call on non-existent keys
   * - Keys are automatically prefixed if configured
   * - Performance: O(1) for single document operations
   * - PouchDB uses soft deletes (marks as deleted)
   * - Emits events for reactive updates
   *
   * @throws {StorageError} On network issues, permissions, or document deletion failures
   */
  public async removeItem(item: Pick<StorageItem, 'key'>): Promise<StorageResult> {
    try {
      const start = performance.now();
      const key = this._generateKey(item.key);

      const [result] = await this.#removeDocuments([key]);
      // Missing results violate the one-result-per-requested-ID contract.
      if (!result) {
        throw new StorageError(`Failed to remove item ${item.key}: missing operation result`);
      }
      // Convert per-item failures into the existing operation-level rejection path.
      if (result.status === 'error') {
        throw result.error;
      }

      // Emit success event with operation statistics
      this.#events.next(
        new StateOperationEvent.Success({
          source: this,
          detail: { fn: 'removeItem', args: [item], result, metric: performance.now() - start },
        }),
      );
      return result;
    } catch (e) {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError(`Failed to remove item ${item.key}`, { cause: e });
      // Emit failure event for monitoring
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'removeItem', args: [item], error },
        }),
      );
      // Re-throw to maintain promise rejection semantics
      throw error;
    }
  }

  /**
   * Bulk removes multiple items in single atomic operation.
   *
   * @param items - Array of objects containing keys to remove
   * @returns Array of StorageResult objects (one per item)
   *
   * @example
   * ```typescript
   * const results = await storage.removeItems([
   *   { key: 'cache.apiResponse' },
   *   { key: 'temp.data' }
   * ]);
   * ```
   *
   * @remarks
   * - More efficient than individual removeItem() calls
   * - Idempotent - safe to call on non-existent keys
   * - Performance: O(n) where n = item count
   * - Atomic operation with possible partial failures
   * - Keys are automatically prefixed if configured
   *
   * @throws {StorageError} On network issues, permissions, or partial bulk deletion failures
   */
  public async removeItems(items: Pick<StorageItem, 'key'>[]): Promise<StorageResult[]> {
    const start = performance.now();

    // If no items are provided, return an empty array
    if (!items.length) {
      const result: StorageResult[] = [];
      this.#events.next(
        new StateOperationEvent.Success({
          source: this,
          detail: {
            fn: 'removeItems',
            message: 'No items provided, nothing to remove',
            args: [items],
            result,
            metric: performance.now() - start,
          },
        }),
      );
      return result;
    }
    try {
      // Deduplicate document IDs so repeated keys cannot race against their own tombstones.
      // Deduplicate generated IDs before deleting, while preserving original order below.
      const ids = [...new Set(items.map((item) => this._generateKey(item.key)))];
      const uniqueResults = await this.#removeDocuments(ids);
      const resultById = new Map<string, StorageResult>();
      // Preserve the unique-ID request order while associating each outcome with its key.
      for (const [index, id] of ids.entries()) {
        const operationResult = uniqueResults[index];
        // A missing result means PouchDB did not account for a requested unique ID.
        if (!operationResult) {
          throw new StorageError(`Failed to remove item ${id}: missing operation result`);
        }
        resultById.set(id, operationResult);
      }

      const result: StorageResult[] = [];
      // Expand deduplicated outcomes back to the caller's original item list.
      for (const item of items) {
        const id = this._generateKey(item.key);
        const operationResult = resultById.get(id);
        // Map each original item back to its deduplicated operation result.
        if (!operationResult) {
          throw new StorageError(`Failed to remove item ${id}: missing operation result`);
        }
        result.push(operationResult);
      }

      // Emit success event with operation statistics
      this.#events.next(
        new StateOperationEvent.Success({
          source: this,
          detail: { fn: 'removeItems', args: [items], result, metric: performance.now() - start },
        }),
      );
      return result;
    } catch (cause) {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError('Failed to remove items', { cause });
      // Emit failure event for monitoring
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'removeItems', args: [items], error },
        }),
      );
      // Re-throw to maintain promise rejection semantics
      throw error;
    }
  }

  /**
   * Internal helper for retrieving all documents with optional content inclusion.
   *
   * @internal
   * @protected
   * @template T - Value type stored in documents
   * @param args - Query options including docs inclusion and pagination
   * @returns PouchDB AllDocsResponse with typed document values
   * @throws {StorageError} When the database query fails.
   */
  protected async _allItems<T extends AllowedValue>(args?: {
    include_docs?: boolean;
    ignore_scope?: boolean;
    limit?: number;
    skip?: number;
    prefix?: string;
  }): Promise<PouchDB.Core.AllDocsResponse<{ value: T }>> {
    const start = performance.now();
    const { include_docs, ignore_scope, limit, skip, prefix } = args || {};

    // determine if the request should include the scope prefix
    const include_scope = !ignore_scope && this.#key_prefix;

    // Build the options for the allDocs query based on the include_scope flag and prefix
    const startkey = include_scope ? this._generateKey(prefix) : prefix;
    const endkey = include_scope ? this._generateKey(`${prefix ?? ''}\ufff0`) : prefix;

    try {
      // Execute the allDocs query
      // PouchDB's allDocs method is much more efficient than individual operations
      const result = await this.#db.allDocs<{ value: T }>({
        include_docs,
        limit,
        skip,
        startkey,
        endkey,
      });
      // Emit success event with operation statistics
      this.#events.next(
        new StateOperationEvent.Success({
          source: this,
          detail: { fn: 'allItems', args: [args], result, metric: performance.now() - start },
        }),
      );
      // Return the result
      return result;
    } catch (cause) {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError('Failed to retrieve all items', { cause });
      // Emit failure event for monitoring
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'allItems', args: [args], error },
        }),
      );
      // Re-throw to maintain promise rejection semantics
      throw error;
    }
  }

  /**
   * Executes bulk document operations and normalizes results.
   *
   * @internal
   * @protected
   * @param args - Arguments to pass to PouchDB's bulkDocs method
   * @returns Array of normalized StorageResult objects
   * @throws {StorageError} When the bulk operation fails.
   */
  protected async _executeBulk(
    ...args: Parameters<PouchDB.Database['bulkDocs']>
  ): Promise<StorageResult[]> {
    const start = performance.now();

    // Execute the bulk operation - this is where the actual database work happens
    // PouchDB's bulkDocs is much more efficient than individual operations
    const dbResult = await this.#db.bulkDocs(...args);

    try {
      // Transform PouchDB's raw response into our standardized StorageResult format
      const result: StorageResult[] = dbResult.map((res) => {
        // PouchDB returns either success objects or error objects
        // We need to detect which type we received and handle accordingly
        if (isPouchDbError(res)) {
          // This document failed to be saved/updated/deleted
          return {
            status: 'error',
            key: res.id ?? 'unknown', // Document ID that failed
            error: new StorageError(res.message ?? 'Unknown error', {
              cause: res, // Preserve original PouchDB error for debugging
            }),
          };
        }

        // This document was successfully processed
        return {
          status: 'success',
          key: res.id ?? 'unknown', // Document ID that succeeded
        };
      });

      // Emit success event with operation statistics
      this.#events.next(
        new StateOperationEvent.Success({
          source: this,
          detail: {
            fn: '_executeBulk',
            args, // Original arguments for debugging
            result, // Normalized results
            metric: performance.now() - start, // Operation duration
          },
        }),
      );

      return result;
    } catch (error) {
      // Handle unexpected errors during result processing
      const storageError = new StorageError('Failed to execute bulk operation', { cause: error });

      // Emit failure event for monitoring
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: { fn: '_executeBulk', args, error: storageError },
        }),
      );

      // Re-throw to maintain promise rejection semantics
      throw storageError;
    }
  }

  /**
   * Creates JSON backup of all storage items with metadata.
   *
   * @returns JSON string containing complete backup with timestamp and documents
   *
   * @example
   * ```typescript
   * const backup = await storage.createBackup();
   * await saveToFile('backup.json', backup);
   * ```
   *
   * @remarks
   * - Includes all items matching current key prefix (if set)
   * - Compatible with restoreBackup() method
   * - Memory usage: O(n) where n = document count
   * - Includes document revisions for conflict resolution
   * - Emits events for monitoring
   *
   * @throws {StorageError} On network issues, permissions, or database errors
   */
  public async createBackup(): Promise<string> {
    try {
      const start = performance.now();

      // Retrieve all documents with full content for backup
      // include_docs: true ensures we get the actual document data, not just metadata
      const allDocs = await this._allItems({ include_docs: true });

      // Structure backup data with metadata for future restoration
      const backupData = {
        timestamp: new Date().toISOString(), // When backup was created
        key_prefix: this.#key_prefix, // Original key prefix for validation
        documents: allDocs.rows.map((row) => ({
          _id: row.id, // Document ID (may include key prefix)
          _rev: row.value.rev, // Document revision for conflict resolution
          value: row.doc?.value, // The actual stored data
        })),
      };

      // Serialize to JSON with pretty printing for human readability
      const result = JSON.stringify(backupData, null, 2);

      // Emit success event with backup statistics
      this.#events.next(
        new StateOperationEvent.Success({
          source: this,
          detail: {
            fn: 'createBackup',
            message: `Backup created with ${allDocs.rows.length} documents`,
            result: { document_count: allDocs.rows.length },
            metric: performance.now() - start,
          },
        }),
      );

      return result;
    } catch (error) {
      // Wrap any errors in our custom StorageError for consistency
      const storageError = new StorageError('Failed to create backup', { cause: error });

      // Emit failure event for monitoring
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'createBackup', error: storageError },
        }),
      );
      throw storageError;
    }
  }

  /**
   * Restores items from backup with optional data clearing.
   *
   * @param backupData - JSON backup string from createBackup()
   * @param options - Restore configuration options
   * @param options.clear_existing - If true, clears all existing data before restoration
   * @returns Array of StorageResult objects for each restored item
   *
   * @example
   * ```typescript
   * const results = await storage.restoreBackup(backupJson, {
   *   clear_existing: false // Merge with existing data
   * });
   * ```
   *
   * @remarks
   * - **DANGER**: clear_existing: true permanently deletes current data
   * - Handles conflicts using document revisions
   * - Bulk operations for efficiency
   * - Memory usage: O(n) where n = backup document count
   * - Partial failures possible
   * - Emits events for monitoring
   *
   * @throws {StorageError} On invalid backup format, network issues, or database errors
   */
  public async restoreBackup(
    backupData: string,
    options: { clear_existing?: boolean } = {},
  ): Promise<StorageResult[]> {
    try {
      const start = performance.now();

      // Parse backup JSON - this can fail if backup is corrupted
      const backup = JSON.parse(backupData);

      // Validate backup format to prevent runtime errors
      // Ensure we have the expected structure from createBackup()
      if (!backup.documents || !Array.isArray(backup.documents)) {
        throw new StorageError('Invalid backup format: missing or invalid documents array');
      }

      let documents: PouchDB.Core.Document<{ value: AllowedValue }>[] = [];
      // If requested, remove all existing data before restoring backup.
      // WARNING: Enabling this will irreversibly delete all current items in storage.
      if (options.clear_existing) {
        await this.clear({ clear_all: true });
        // Don't preserve _rev to avoid conflicts - database is empty, no rev should be present
        documents = backup.documents.map(
          (doc: { _id: string; _rev: string; value: AllowedValue }) => ({
            _id: doc._id, // Original document ID (may include old key prefix)
            value: doc.value, // The actual data to restore
          }),
        );
      } else {
        // Fetch existing items to merge with backup data
        const existingItems = await this._allItems({ include_docs: false });

        // Merge existing data with backup data
        documents = backup.documents.map(
          (doc: { _id: string; _rev: string; value: AllowedValue }) => {
            // Only include the revision if it exists in the existing items
            const _rev = existingItems.rows.find((item) => item.id === doc._id)?.value.rev;
            return {
              _id: doc._id, // Original document ID (may include old key prefix)
              _rev, // Existing revision or new revision
              value: doc.value, // The actual data to restore
            };
          },
        );
      }

      // Execute bulk restoration - much faster than individual operations
      const results = await this._executeBulk(documents);

      // Calculate success/failure statistics for monitoring
      // Report separate counts so callers can monitor partial restore failures.
      // Count outcomes separately so restore metrics expose partial failures.
      let successCount = 0;
      let errorCount = 0;
      // Inspect every result because a bulk restore can partially succeed.
      for (const result of results) {
        // Classify each operation result for the restore summary.
        if (result.status === 'success') {
          successCount += 1;
        } else {
          errorCount += 1;
        }
      }

      // Emit success event with detailed restoration statistics
      this.#events.next(
        new StateOperationEvent.Success({
          source: this,
          detail: {
            fn: 'restoreBackup',
            args: [backupData, options],
            message: `Restored ${successCount} documents, ${errorCount} errors`,
            result: { success_count: successCount, error_count: errorCount },
            metric: performance.now() - start,
          },
        }),
      );

      return results;
    } catch (error) {
      // Handle both JSON parsing errors and database operation errors
      const storageError = new StorageError('Failed to restore backup', { cause: error });

      // Emit failure event for monitoring and debugging
      this.#events.next(
        new StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'restoreBackup', args: [backupData, options], error: storageError },
        }),
      );
      throw storageError;
    }
  }

  /**
   * Cleanup resources and cancel subscriptions.
   *
   * Implements Disposable interface for proper resource management.
   * Cancels change feeds, completes event subjects, and closes connections.
   */
  [Symbol.dispose](): void {
    this.#disposed = true;
    // Cancel pending retries so disposal cannot keep asynchronous cleanup alive.
    for (const { timer, resolve } of this.#conflictRetryTimers.values()) {
      clearTimeout(timer);
      resolve();
    }
    this.#conflictRetryTimers.clear();
    // Snapshot-and-clear rather than iterate `this.#teardown` directly - a teardown can itself
    // deregister other entries (e.g. `_pullOnce`'s `finish()` removing its own and a sibling
    // registration), and splicing the array mid-iteration would skip whatever shifted into the
    // index the iterator already passed.
    for (const teardown of this.#teardown.splice(0)) {
      teardown();
    }
  }
}

export default PouchDbStorage;
