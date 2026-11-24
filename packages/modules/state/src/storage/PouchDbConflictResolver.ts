import type { AllowedValue } from '../types.js';
import { StorageError } from './StorageError.js';
import type { StorageResult } from './types.js';

const STORAGE_KEY_SEPARATOR = '::';
const CONFLICT_SCAN_PAGE_SIZE = 100;
const MAX_CONFLICT_RESOLUTION_ATTEMPTS = 3;
const MAX_CONFLICT_RESOLUTION_RETRY_CYCLES = 3;
const CONFLICT_RESOLUTION_RETRY_DELAY_MS = 250;
const MAX_BULK_DELETE_DOCUMENTS = 500;
const MAX_LOCAL_BULK_DELETE_PAYLOAD_BYTES = 1_000_000;

interface PouchDbDeletionDocument {
  _id: string;
  _rev: string;
  _deleted: true;
}

/**
 * Configuration for {@link PouchDbConflictResolver}.
 */
export interface PouchDbConflictResolverOptions {
  /** Optional namespace prefix limiting startup scans to one app/scope. */
  keyPrefix?: string;
  /** Callback invoked when background conflict cleanup fails after bounded retries. */
  onError: (id: string, cause: unknown) => void;
}

/**
 * Type guard discriminating PouchDB bulk error entries from successful responses.
 * @param res - Bulk operation entry returned by PouchDB.
 * @returns True when the entry represents a per-document failure.
 */
function isPouchDbError(
  res: PouchDB.Core.Response | PouchDB.Core.Error,
): res is PouchDB.Core.Error {
  return Boolean((res as PouchDB.Core.Error).error);
}

/**
 * Extracts a numeric HTTP-style status code from a PouchDB error object.
 * @param error - Value thrown or returned by a PouchDB operation.
 * @returns Numeric status code when present, otherwise undefined.
 */
function getPouchDbErrorStatus(error: unknown): number | undefined {
  // PouchDB adapters expose numeric status fields, though callers can throw arbitrary values.
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined;
  }
  return typeof error.status === 'number' ? error.status : undefined;
}

/**
 * Determines whether a PouchDB error indicates a stale revision that should be re-read.
 * @param error - Value thrown or returned by a PouchDB operation.
 * @returns True for 404 (not found) or 409 (revision conflict).
 */
function isRetryablePouchDbError(error: unknown): boolean {
  const status = getPouchDbErrorStatus(error);
  return status === 404 || status === 409;
}

/**
 * Extracts validated live conflict leaf revisions from a PouchDB document.
 * @param document - Document fetched with `{ conflicts: true }`.
 * @returns Array of conflicting leaf revision strings.
 */
function getConflictingRevisions(document: object): string[] {
  // Guard against adapters or mocks omitting or mangling `_conflicts`.
  if (!('_conflicts' in document) || !Array.isArray(document._conflicts)) {
    return [];
  }
  const revisions: unknown[] = document._conflicts;
  // Ignore non-string entries rather than passing invalid revisions to bulkDocs.
  return revisions.filter((revision): revision is string => typeof revision === 'string');
}

/**
 * Handles winner-preserving conflict cleanup and conflict-aware deletion for PouchDB state storage.
 *
 * Relies on CouchDB/PouchDB's deterministic winner invariant (`winningRev` in `pouchdb-merge`):
 * any live (non-deleted) leaf always beats any deleted leaf regardless of generation depth.
 * Consequently, a document with a deleted winner or 404 lookup has zero remaining live leaves.
 */
export class PouchDbConflictResolver implements Disposable {
  #db: PouchDB.Database;
  #keyPrefix?: string;
  #onError: (id: string, cause: unknown) => void;
  #activeResolutions = new Map<string, Promise<void>>();
  #pendingResolutions = new Set<string>();
  #retryTimers = new Map<string, { timer: ReturnType<typeof setTimeout>; resolve: VoidFunction }>();
  #disposed = false;

  /**
   * Checks whether a PouchDB document carries live losing conflict revisions.
   * @param document - Document fetched with `{ conflicts: true }`.
   * @returns True when at least one conflicting leaf revision is present.
   */
  public static hasConflicts(document: object): boolean {
    return getConflictingRevisions(document).length > 0;
  }

  /**
   * Creates a conflict resolver bound to a PouchDB database instance.
   * @param db - Underlying PouchDB database.
   * @param options - Scope prefix and error reporting callback.
   */
  constructor(db: PouchDB.Database, options: PouchDbConflictResolverOptions) {
    this.#db = db;
    this.#keyPrefix = options.keyPrefix;
    this.#onError = options.onError;
  }

  /**
   * Schedules background conflict resolution for a document, routing errors to `onError`.
   * @param id - Full PouchDB document ID.
   */
  public schedule(id: string): void {
    // Disposed storage must not start or queue new conflict cleanup work.
    if (this.#disposed) {
      return;
    }
    // Coalesce onto an active pass without attaching a duplicate error handler.
    if (this.#activeResolutions.has(id)) {
      this.#pendingResolutions.add(id);
      return;
    }
    void this.resolve(id).catch((error) => {
      // Suppress late asynchronous failures once storage teardown has started.
      if (!this.#disposed) {
        this.#onError(id, error);
      }
    });
  }

  /**
   * Resolves all live losing leaves for one document while preserving its winning revision.
   * Coalesces concurrent calls for the same ID and replays once if a change arrives mid-flight.
   * @param id - Full PouchDB document ID.
   * @returns Resolves when no live losing leaves remain or the resolver is disposed.
   * @throws {StorageError} When permanent failures occur or bounded retry cycles are exhausted.
   */
  public resolve(id: string): Promise<void> {
    // Disposed storage must not start new database writes.
    if (this.#disposed) {
      return Promise.resolve();
    }
    const active = this.#activeResolutions.get(id);
    // Coalesce duplicate events and record that another read is needed after the active pass.
    if (active) {
      this.#pendingResolutions.add(id);
      return active;
    }

    const resolution = this.#resolveUntilStable(id).finally(() => {
      this.#activeResolutions.delete(id);
      // Release the active entry first so a change arriving at completion triggers a fresh pass.
      if (this.#pendingResolutions.delete(id) && !this.#disposed) {
        this.schedule(id);
      }
    });
    this.#activeResolutions.set(id, resolution);
    return resolution;
  }

  /**
   * Scans existing scoped documents in bounded pages and cleans up pre-existing conflict leaves.
   * @returns Resolves after all live documents in scope have been inspected.
   */
  public async scanExisting(): Promise<void> {
    const scopePrefix = this.#keyPrefix ? `${this.#keyPrefix}${STORAGE_KEY_SEPARATOR}` : undefined;
    let startkey = scopePrefix;
    let cursor: string | undefined;

    // Paginate through live documents so startup cleanup yields between pages.
    while (!this.#disposed) {
      // Combine the active pagination cursor and optional scope upper bound for this page.
      const response = await this.#db.allDocs<{ value: AllowedValue }>({
        include_docs: true,
        conflicts: true,
        limit: CONFLICT_SCAN_PAGE_SIZE,
        ...(startkey !== undefined ? { startkey } : {}),
        ...(scopePrefix !== undefined ? { endkey: `${scopePrefix}\ufff0` } : {}),
      });

      // Resolve conflicted documents serially to bound concurrent writes during startup.
      for (const row of response.rows) {
        // Inclusive startkey repeats the previous cursor only if it still exists; never skip its successor.
        if (row.id === cursor) {
          // Discard only the cursor row itself so a deleted cursor cannot skip the next document.
          continue;
        }
        // Stop scanning immediately if the storage instance is disposed mid-page.
        if (this.#disposed) {
          return;
        }
        // Only live documents carrying `_conflicts` require cleanup.
        if ('error' in row || !row.doc || !PouchDbConflictResolver.hasConflicts(row.doc)) {
          // Skip missing, deleted, or conflict-free rows without scheduling writes.
          continue;
        }
        const active = this.#activeResolutions.get(row.id);
        // Wait for an already-active pass without duplicating error reporting or queuing extra work.
        if (active) {
          await active.catch(() => undefined);
          // The active pass's initiating caller owns error reporting for this run.
          continue;
        }
        try {
          await this.resolve(row.id);
        } catch (error) {
          // Report per-document failures without aborting cleanup for remaining documents.
          if (!this.#disposed) {
            this.#onError(row.id, error);
          }
        }
      }

      const lastRow = response.rows.at(-1);
      // A short page proves the end of the scoped key range has been reached.
      if (response.rows.length < CONFLICT_SCAN_PAGE_SIZE || !lastRow) {
        return;
      }
      startkey = lastRow.id;
      cursor = lastRow.id;
    }
  }

  /**
   * Deletes all live leaves for the requested document IDs using bounded sequential bulk passes.
   * Preserves caller ordering and duplicates while deduplicating underlying database writes.
   * @param ids - Full PouchDB document IDs to remove (may contain duplicates).
   * @returns One {@link StorageResult} per entry in `ids`, in caller order.
   * @throws {StorageError} When PouchDB returns an unattributable bulk deletion failure.
   */
  public async removeDocuments(ids: string[]): Promise<StorageResult[]> {
    // Preserve empty-input behavior without issuing unnecessary database reads.
    if (ids.length === 0) {
      return [];
    }

    const errors = new Map<string, StorageError>();
    let pendingIds = [...new Set(ids)];

    // Re-read after each bulk delete pass so concurrent replication races are caught in bulk,
    // without fanning out per-document reads across large deletions.
    for (let attempt = 0; attempt < MAX_CONFLICT_RESOLUTION_ATTEMPTS; attempt += 1) {
      const rows = await this.#readDocumentsInChunks(pendingIds);
      const deletions: PouchDbDeletionDocument[] = [];
      const attemptedIds = new Set<string>();

      // Collect every currently live leaf (winner + `_conflicts`) for each live document.
      for (const row of rows) {
        // Missing rows and tombstoned winners have zero live leaves remaining.
        if ('error' in row || !row.doc || row.value.deleted === true) {
          // Skip documents that already have no live leaves to tombstone.
          continue;
        }
        attemptedIds.add(row.id);
        const revisions = new Set([row.doc._rev, ...getConflictingRevisions(row.doc)]);
        // Emit one tombstone per distinct live revision so no losing leaf can resurface.
        for (const _rev of revisions) {
          deletions.push({ _id: row.id, _rev, _deleted: true });
        }
      }

      // When no live leaves remain in this pass, all remaining documents are cleanly tombstoned.
      if (deletions.length === 0) {
        pendingIds = [];
        // Exit the retry loop once the verification read confirms zero live leaves remain.
        break;
      }

      const bulkResults = await this.#bulkDeleteDocuments(deletions);
      // Record permanent failures immediately and exclude them from further retries.
      for (const result of bulkResults) {
        // Successful tombstones still stay in `attemptedIds` for the batched verification read.
        if (!isPouchDbError(result)) {
          // Only error entries need failure attribution or permanent-error filtering.
          continue;
        }
        // A failure without an ID cannot be mapped back to a specific requested key.
        if (!result.id) {
          throw new StorageError('PouchDB returned a deletion failure without a document ID', {
            cause: result,
          });
        }
        // Retryable 404/409 races are re-read on the next pass; permanent errors stop retrying.
        if (!isRetryablePouchDbError(result)) {
          attemptedIds.delete(result.id);
          // Preserve the first permanent error reported for this document.
          if (!errors.has(result.id)) {
            errors.set(
              result.id,
              new StorageError(`Failed to remove item ${result.id}`, { cause: result }),
            );
          }
        }
      }

      pendingIds = [...attemptedIds];
      // All attempted documents failed permanently; skip unnecessary verification reads.
      if (pendingIds.length === 0) {
        // Stop retrying once no retryable document IDs remain.
        break;
      }
    }

    // Confirm no live leaves survived when all retry attempts performed writes.
    if (pendingIds.length > 0) {
      const remainingRows = await this.#readDocumentsInChunks(pendingIds);
      // Any document that is still live after the final attempt must surface an error.
      for (const row of remainingRows) {
        // Only non-deleted rows with a live document represent unremoved leaves.
        if (!('error' in row) && row.doc && row.value.deleted !== true && !errors.has(row.id)) {
          errors.set(
            row.id,
            new StorageError(`Failed to remove every live revision for ${row.id}`),
          );
        }
      }
    }

    // Map deduplicated outcomes back to the caller's exact input list and order.
    return ids.map((id) => {
      const error = errors.get(id);
      return error ? { status: 'error', key: id, error } : { status: 'success', key: id };
    });
  }

  /**
   * Cancels pending retry timers and prevents further background conflict cleanup.
   */
  public [Symbol.dispose](): void {
    this.#disposed = true;
    // Unblock and cancel scheduled backoff timers so disposal does not leak pending promises.
    for (const { timer, resolve } of this.#retryTimers.values()) {
      clearTimeout(timer);
      resolve();
    }
    this.#retryTimers.clear();
  }

  /**
   * Repeatedly deletes bounded batches of losing leaves until the revision tree stabilizes.
   * @param id - Full PouchDB document ID.
   * @returns Resolves once no losing leaves remain or the resolver is disposed.
   * @throws {StorageError} When permanent errors occur or consecutive races exhaust retries.
   */
  async #resolveUntilStable(id: string): Promise<void> {
    let raceAttempts = 0;
    let retryCycles = 0;

    // Loop with fresh reads so large conflict sets drain incrementally and races use fresh revisions.
    while (!this.#disposed) {
      this.#pendingResolutions.delete(id);
      const document = await this.#getLiveDocument(id);
      // A missing or tombstoned document has no live conflict leaves to resolve.
      if (!document || this.#disposed) {
        return;
      }

      // Never tombstone the current winning revision.
      const conflicts = getConflictingRevisions(document).filter(
        (revision) => revision !== document._rev,
      );
      // Stop once the tree has no losing leaves and no concurrent change queued a recheck.
      if (conflicts.length === 0) {
        // A change event received during the read requires one more verification pass.
        if (!this.#pendingResolutions.has(id)) {
          return;
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        // Re-read the document because a new change event arrived while this pass was reading.
        continue;
      }

      const deletedCount = await this.#deleteRevisions(
        id,
        conflicts.slice(0, MAX_BULK_DELETE_DOCUMENTS),
      );
      // Stop immediately if disposal occurred while awaiting bulkDocs.
      if (this.#disposed) {
        return;
      }

      // Reset race counters whenever at least one losing leaf was tombstoned.
      if (deletedCount > 0) {
        raceAttempts = 0;
        retryCycles = 0;
      } else {
        raceAttempts += 1;
        // After consecutive no-progress batches, verify whether conflicts still exist before backing off.
        if (raceAttempts >= MAX_CONFLICT_RESOLUTION_ATTEMPTS) {
          const remaining = await this.#getLiveDocument(id);
          // Another resolver or deletion may have already drained the conflict tree.
          if (this.#disposed || !remaining || !PouchDbConflictResolver.hasConflicts(remaining)) {
            return;
          }
          // Surface persistent contention instead of looping indefinitely.
          if (retryCycles >= MAX_CONFLICT_RESOLUTION_RETRY_CYCLES) {
            throw new StorageError(
              `Conflict resolution made no progress after ${retryCycles + 1} retry cycles for ${id}`,
            );
          }
          retryCycles += 1;
          raceAttempts = 0;
          await this.#waitForRetry(id, CONFLICT_RESOLUTION_RETRY_DELAY_MS * 2 ** (retryCycles - 1));
          // Re-fetch fresh revisions after backoff rather than falling through to an extra yield.
          continue;
        }
      }

      // Yield between batches so large conflict trees do not block the event loop.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  /**
   * Fetches the current live document with conflict metadata, returning null if absent or deleted.
   * @param id - Full PouchDB document ID.
   * @returns Live winning document with `_conflicts`, or null when 404.
   * @throws {Error} When the read fails for a reason other than 404.
   */
  async #getLiveDocument(
    id: string,
  ): Promise<(PouchDB.Core.Document<{ value: AllowedValue }> & PouchDB.Core.GetMeta) | null> {
    try {
      return await this.#db.get<{ value: AllowedValue }>(id, { conflicts: true });
    } catch (error) {
      // PouchDB returns 404 only when no live leaf exists for the document.
      if (getPouchDbErrorStatus(error) === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Reads conflict metadata for document IDs in sequential bounded chunks.
   * @param ids - Unique PouchDB document IDs to inspect.
   * @returns Combined `allDocs` rows across all chunks.
   */
  async #readDocumentsInChunks(
    ids: string[],
  ): Promise<PouchDB.Core.AllDocsWithKeysResponse<{ value: AllowedValue }>['rows']> {
    const rows: PouchDB.Core.AllDocsWithKeysResponse<{ value: AllowedValue }>['rows'] = [];
    // Chunk key lookups sequentially to bound memory and concurrent database work on large scopes.
    for (let offset = 0; offset < ids.length; offset += MAX_BULK_DELETE_DOCUMENTS) {
      const response = await this.#db.allDocs<{ value: AllowedValue }>({
        keys: ids.slice(offset, offset + MAX_BULK_DELETE_DOCUMENTS),
        include_docs: true,
        conflicts: true,
      });
      rows.push(...response.rows);
    }
    return rows;
  }

  /**
   * Writes tombstones for a set of losing revisions, throwing immediately on permanent errors.
   * @param id - Full PouchDB document ID.
   * @param revisions - Losing leaf revisions to tombstone.
   * @returns Number of revisions successfully tombstoned.
   * @throws {StorageError} When PouchDB reports any non-retryable failure.
   */
  async #deleteRevisions(id: string, revisions: string[]): Promise<number> {
    // Build tombstone entries for only the specified losing revisions.
    const deletions: PouchDbDeletionDocument[] = revisions.map((_rev) => ({
      _id: id,
      _rev,
      _deleted: true,
    }));
    const results = await this.#bulkDeleteDocuments(deletions);
    // Inspect every entry because bulkDocs reports partial failures inline instead of rejecting.
    const failures = results.filter(isPouchDbError);
    // Retryable 404/409 races are refreshed by the caller; permanent errors must fail fast.
    const permanentFailures = failures.filter((failure) => !isRetryablePouchDbError(failure));
    // Surface non-retryable failures immediately rather than burning retry cycles.
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
   * Submits deletion tombstones in sequential local `bulkDocs` batches bounded by count and size.
   * @param deletions - Tombstone documents to write.
   * @returns Raw PouchDB results for every submitted tombstone.
   * @throws {StorageError} When a single tombstone exceeds the local payload size limit.
   */
  async #bulkDeleteDocuments(
    deletions: PouchDbDeletionDocument[],
  ): Promise<Array<PouchDB.Core.Response | PouchDB.Core.Error>> {
    const results: Array<PouchDB.Core.Response | PouchDB.Core.Error> = [];
    const encoder = new TextEncoder();
    let offset = 0;

    // Partition writes sequentially by both document count and serialized byte size.
    while (offset < deletions.length) {
      const batch: PouchDbDeletionDocument[] = [];
      let payloadBytes = 1_024;
      // Pack entries until either local batch cap would be exceeded.
      while (offset < deletions.length && batch.length < MAX_BULK_DELETE_DOCUMENTS) {
        const deletion = deletions[offset];
        const deletionBytes =
          encoder.encode(JSON.stringify(deletion)).byteLength + (batch.length > 0 ? 1 : 0);
        // Stop before overflowing the local payload limit; fail if a single entry cannot fit.
        if (payloadBytes + deletionBytes > MAX_LOCAL_BULK_DELETE_PAYLOAD_BYTES) {
          // A single oversized tombstone cannot be split further.
          if (batch.length === 0) {
            throw new StorageError('A deletion document exceeds the maximum bulk request size');
          }
          // Flush the current batch and start the next batch at the same offset.
          break;
        }
        batch.push(deletion);
        payloadBytes += deletionBytes;
        offset += 1;
      }

      results.push(...(await this.#db.bulkDocs(batch)));
    }

    return results;
  }

  /**
   * Waits for a bounded backoff interval that resolves early if the resolver is disposed.
   * @param id - Document ID waiting for retry.
   * @param delayMs - Backoff delay in milliseconds.
   */
  async #waitForRetry(id: string, delayMs: number): Promise<void> {
    // Do not register timers after disposal has started.
    if (this.#disposed) {
      return;
    }
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        this.#retryTimers.delete(id);
        resolve();
      }, delayMs);
      this.#retryTimers.set(id, { timer, resolve });
    });
  }
}
