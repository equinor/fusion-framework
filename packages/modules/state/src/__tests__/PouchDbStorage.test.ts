import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PouchDbStorage } from '../storage/PouchDbStorage.js';
import { StateOperationEvent, StateChangeEvent, type StateEventType } from '../events/index.js';

const EXPECTED_CONFLICT_RACE_ATTEMPTS = 3;
const EXPECTED_CONFLICT_RETRY_CYCLES = 3;

/**
 * Seeds one document with multiple independently written leaf revisions.
 * @param database - PouchDB database receiving the replica leaves.
 * @param id - Full document ID.
 * @param count - Number of concurrent leaves to insert.
 * @returns Resolves after PouchDB has accepted the replica revisions.
 */
async function seedConflictLeaves(
  database: PouchDB.Database,
  id: string,
  count: number,
): Promise<void> {
  const documents = Array.from({ length: count }, (_value, index) => {
    const revisionId = index.toString(16).padStart(32, '0');
    return {
      _id: id,
      _rev: `2-${revisionId}`,
      _revisions: { start: 2, ids: [revisionId, 'root'] },
      value: `value-${index}`,
    };
  });
  await database.bulkDocs(documents, { new_edits: false });
}

type TestDeletionDocument = {
  _id: string;
  _rev: string;
  _deleted: true;
};

function isDeletionBatch(value: unknown): value is TestDeletionDocument[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (document: unknown): document is TestDeletionDocument =>
        typeof document === 'object' &&
        document !== null &&
        '_id' in document &&
        typeof document._id === 'string' &&
        '_rev' in document &&
        typeof document._rev === 'string' &&
        '_deleted' in document &&
        document._deleted === true,
    )
  );
}

function createConflictError(document: TestDeletionDocument) {
  return {
    id: document._id,
    error: 'conflict',
    name: 'conflict',
    status: 409,
    message: 'Injected stale revision',
  };
}

describe('PouchDbStorage', () => {
  let db: PouchDB.Database;
  const dbName = 'test-db';

  beforeEach(async () => {
    db = PouchDbStorage.CreateDb(dbName);
  });

  afterEach(async () => {
    // Clean up any existing data first
    try {
      const allDocs = await db.allDocs();
      const deletions = allDocs.rows.map((row) => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true,
      }));
      if (deletions.length > 0) {
        await db.bulkDocs(deletions);
      }
    } catch {
      // Ignore cleanup errors
    }

    // Destroy the database
    await db.destroy();
  });

  describe('event emission', () => {
    it('should emit events for changes after initialization', async () => {
      const storage = new PouchDbStorage(db);

      // Initialize - should NOT emit events for existing data
      await storage.initialize();

      // Give the changes feed time to set up
      await new Promise((resolve) => setTimeout(resolve, 10));

      const events: StateEventType[] = [];

      // Subscribe to events before initialization
      const subscription = storage.events$.subscribe((event) => {
        events.push(event);
      });

      // Add some data after initialization
      await storage.putItem({ key: 'test-item-1', value: 'value1' });
      await storage.putItem({ key: 'test-item-1', value: 'value2' });

      await vi.waitFor(() => expect(events.length).toBe(4), { timeout: 100 });

      subscription.unsubscribe();

      expect(events[0].type).toBe(StateOperationEvent.Success.Type);
      expect(events[1].type).toBe(StateChangeEvent.Created.Type);
      if ('item' in events[1].detail && events[1].detail.item) {
        expect(events[1].detail.item.key).toBe('test-item-1');
        expect(events[1].detail.item.value).toBe('value1');
      } else {
        throw new Error('Expected item in events[1].detail');
      }
      expect(events[2].type).toBe(StateOperationEvent.Success.Type);
      expect(events[3].type).toBe(StateChangeEvent.Updated.Type);
      if ('item' in events[3].detail && events[3].detail.item) {
        expect(events[3].detail.item.key).toBe('test-item-1');
      } else {
        throw new Error('Expected item in events[3].detail');
      }
      expect(events[3].detail.item.value).toBe('value2');
    });
  });

  describe('backup and restore functionality', () => {
    it('should create and restore backup successfully', async () => {
      const storage = new PouchDbStorage(db);

      // Add some test data
      await storage.putItem({ key: 'user.name', value: 'John Doe' });
      await storage.putItem({ key: 'user.email', value: 'john@example.com' });
      await storage.putItem({ key: 'settings.theme', value: 'dark' });

      // Create backup
      const backup = await storage.createBackup();
      expect(typeof backup).toBe('string');

      // Parse backup to verify structure
      const backupData = JSON.parse(backup);
      expect(backupData).toHaveProperty('timestamp');
      expect(backupData).toHaveProperty('documents');
      expect(Array.isArray(backupData.documents)).toBe(true);
      expect(backupData.documents.length).toBe(3);

      await storage.removeItem({ key: 'user.name' });
      await expect(storage.allItems().then((e) => e.items.length)).resolves.toBe(2);

      // Restore from backup
      const restoreResults = await storage.restoreBackup(backup, { clear_existing: false });
      expect(restoreResults.length).toBe(3);
      expect(restoreResults.every((r) => r.status === 'success')).toBe(true);

      // Verify restored data
      const restoredItems = await storage.allItems();
      expect(restoredItems.items.length).toBe(3);

      const nameItem = await storage.item('user.name');
      expect(nameItem?.value).toBe('John Doe');

      const emailItem = await storage.item('user.email');
      expect(emailItem?.value).toBe('john@example.com');

      const themeItem = await storage.item('settings.theme');
      expect(themeItem?.value).toBe('dark');
    });

    it('should handle empty storage backup', async () => {
      const storage = new PouchDbStorage(db);

      const backup = await storage.createBackup();
      const backupData = JSON.parse(backup);

      expect(backupData.documents).toHaveLength(0);
    });
  });

  describe('key prefix functionality', () => {
    it('should generate a key with the prefix', async () => {
      const spy = vi.spyOn(db, 'put');
      const storage = new PouchDbStorage(db, { key_prefix: 'my-app' });
      await storage.putItem({ key: 'foo', value: 1 });
      expect(spy).toHaveBeenCalledWith({ _id: 'my-app::foo', value: 1 });
    });

    it('clears scoped keys beyond the default prefix boundary only', async () => {
      await db.bulkDocs([
        { _id: 'app::z', value: 'remove' },
        { _id: 'other::z', value: 'keep' },
      ]);
      const storage = new PouchDbStorage(db, { key_prefix: 'app' });

      await expect(storage.clear({ clear_all: false })).resolves.toMatchObject([
        { status: 'success', key: 'app::z' },
      ]);
      await expect(db.get('app::z')).rejects.toMatchObject({ status: 404 });
      await expect(db.get('other::z')).resolves.toMatchObject({ value: 'keep' });

      storage[Symbol.dispose]();
    });

    it('should filter items by prefix', async () => {
      const storage = new PouchDbStorage(db, { key_prefix: 'my-app' });
      await storage.putItem({ key: 'foo.name', value: 'John' });
      await storage.putItem({ key: 'foo.age', value: 30 });
      await storage.putItem({ key: 'bar.name', value: 'Jane' });
      await storage.putItem({ key: 'bar.age', value: 25 });

      await expect(storage.allItems()).resolves.toMatchObject({
        items: [
          { key: 'bar.age', value: 25 },
          { key: 'bar.name', value: 'Jane' },
          { key: 'foo.age', value: 30 },
          { key: 'foo.name', value: 'John' },
        ],
      });

      await expect(storage.allItems({ prefix: 'foo' })).resolves.toMatchObject({
        items: [
          { key: 'foo.age', value: 30 },
          { key: 'foo.name', value: 'John' },
        ],
      });
      await expect(storage.allItems({ prefix: 'bar' })).resolves.toMatchObject({
        items: [
          { key: 'bar.age', value: 25 },
          { key: 'bar.name', value: 'Jane' },
        ],
      });
    });
  });

  describe('conflict resolution', () => {
    it('continues resolving successful batches beyond 1500 losing leaves', async () => {
      const key = 'large-conflict';
      await seedConflictLeaves(db, key, 1_602);
      const winnerBefore = await db.get(key);
      const storage = new PouchDbStorage(db);

      await storage.initialize();
      await vi.waitFor(
        async () => {
          const document = await db.get(key, { conflicts: true });
          expect(document._conflicts ?? []).toHaveLength(0);
        },
        { timeout: 30_000 },
      );

      const winnerAfter = await db.get(key);
      expect(winnerAfter._rev).toBe(winnerBefore._rev);
      expect(winnerAfter.value).toBe(winnerBefore.value);
      storage[Symbol.dispose]();
    }, 30_000);

    it('preserves the winning revision while resolving a 293-leaf conflict on startup', async () => {
      const key = 'my-app::concurrent';
      await seedConflictLeaves(db, key, 293);
      const winnerBefore = await db.get(key);
      const storage = new PouchDbStorage(db, { key_prefix: 'my-app' });

      await storage.initialize();
      await vi.waitFor(
        async () => {
          const document = await db.get(key, { conflicts: true });
          expect(document._conflicts ?? []).toHaveLength(0);
        },
        { timeout: 10_000 },
      );

      const winnerAfter = await db.get(key);
      expect(winnerAfter._rev).toBe(winnerBefore._rev);
      expect(winnerAfter.value).toBe(winnerBefore.value);
      storage[Symbol.dispose]();
    });

    it('resolves conflicts introduced after initialization', async () => {
      const key = 'live-conflict';
      const storage = new PouchDbStorage(db);
      await storage.initialize();

      // Let the since-now feed attach before simulating a replicated conflict.
      await new Promise((resolve) => setTimeout(resolve, 10));
      await seedConflictLeaves(db, key, 3);

      await vi.waitFor(
        async () => {
          const document = await db.get(key, { conflicts: true });
          expect(document._conflicts ?? []).toHaveLength(0);
        },
        { timeout: 10_000 },
      );

      storage[Symbol.dispose]();
    });

    it('rechecks after a conflicting leaf arrives during cleanup', async () => {
      const key = 'racing-conflict';
      await seedConflictLeaves(db, key, 4);
      const originalBulkDocs = db.bulkDocs.bind(db);
      const bulkDocs = vi.spyOn(db, 'bulkDocs');
      let injected = false;
      let winnerBeforeCleanup: string | undefined;
      bulkDocs.mockImplementation(async (documents, options) => {
        if (!injected && Array.isArray(documents)) {
          injected = true;
          const revisionId = 'f'.repeat(32);
          await originalBulkDocs(
            [
              {
                _id: key,
                _rev: `2-${revisionId}`,
                _revisions: { start: 2, ids: [revisionId, 'root'] },
                value: 'racing-value',
              },
            ],
            { new_edits: false },
          );
          winnerBeforeCleanup = (await db.get(key))._rev;
        }
        return originalBulkDocs(documents, options);
      });

      const storage = new PouchDbStorage(db);
      await storage.initialize();
      await vi.waitFor(
        async () => {
          const document = await db.get(key, { conflicts: true });
          expect(document._conflicts ?? []).toHaveLength(0);
        },
        { timeout: 10_000 },
      );

      expect(injected).toBe(true);
      expect((await db.get(key))._rev).toBe(winnerBeforeCleanup);
      storage[Symbol.dispose]();
    });

    it('continues after a partial bulk deletion failure', async () => {
      const key = 'partial-conflict';
      await seedConflictLeaves(db, key, 4);
      const originalBulkDocs = db.bulkDocs.bind(db);
      const bulkDocs = vi.spyOn(db, 'bulkDocs');
      let failedOneRevision = false;
      bulkDocs.mockImplementation(async (documents, options) => {
        if (!failedOneRevision && isDeletionBatch(documents) && documents.length > 1) {
          failedOneRevision = true;
          const [failedDocument, ...successfulDocuments] = documents;
          const successfulResults = await originalBulkDocs(successfulDocuments, options);
          return [createConflictError(failedDocument), ...successfulResults];
        }
        return originalBulkDocs(documents, options);
      });

      const storage = new PouchDbStorage(db);
      await storage.initialize();
      await vi.waitFor(
        async () => {
          const document = await db.get(key, { conflicts: true });
          expect(document._conflicts ?? []).toHaveLength(0);
        },
        { timeout: 10_000 },
      );

      expect(failedOneRevision).toBe(true);
      storage[Symbol.dispose]();
    });

    it('surfaces a permanent failure in a partially successful bulk removal', async () => {
      const successfulKey = 'permanent-partial-success';
      const failingKey = 'permanent-partial-failure';
      await db.bulkDocs([
        { _id: successfulKey, value: 'remove me' },
        { _id: failingKey, value: 'keep me' },
      ]);

      const originalBulkDocs = db.bulkDocs.bind(db);
      const bulkDocs = vi.spyOn(db, 'bulkDocs');
      bulkDocs.mockImplementation(async (documents, options) => {
        if (
          isDeletionBatch(documents) &&
          documents.some((document) => document._id === failingKey)
        ) {
          const successfulDocuments = documents.filter(
            (document) => document._id === successfulKey,
          );
          const successfulResults =
            successfulDocuments.length > 0
              ? await originalBulkDocs(successfulDocuments, options)
              : [];
          let resultIndex = 0;
          return documents.map((document) =>
            document._id === failingKey
              ? {
                  id: document._id,
                  error: 'forbidden',
                  name: 'forbidden',
                  status: 403,
                  message: 'Injected permanent deletion failure',
                }
              : successfulResults[resultIndex++],
          );
        }
        return originalBulkDocs(documents, options);
      });

      const storage = new PouchDbStorage(db);
      const results = await storage.removeItems([{ key: successfulKey }, { key: failingKey }]);

      expect(results[0]).toMatchObject({ status: 'success', key: successfulKey });
      expect(results[1]).toMatchObject({ status: 'error', key: failingKey });
      if (results[1]?.status !== 'error') {
        throw new Error('Expected the permanent deletion failure to be returned');
      }
      expect(results[1].error.message).toContain('Failed to remove item');
      await expect(db.get(successfulKey)).rejects.toMatchObject({ status: 404 });
      await expect(db.get(failingKey)).resolves.toMatchObject({ value: 'keep me' });
      storage[Symbol.dispose]();
    });

    it('retries after queued changes when consecutive race failures exhaust a retry cycle', async () => {
      const key = 'queued-race';
      await seedConflictLeaves(db, key, 4);
      const storage = new PouchDbStorage(db);
      const originalBulkDocs = db.bulkDocs.bind(db);
      const bulkDocs = vi.spyOn(db, 'bulkDocs');
      let raceFailures = 0;
      let queuedChange = false;
      const observedChange = new Promise<void>((resolve) => {
        const subscription = storage.events$.subscribe((event) => {
          if (
            event.type === StateChangeEvent.Created.Type ||
            event.type === StateChangeEvent.Updated.Type
          ) {
            subscription.unsubscribe();
            resolve();
          }
        });
      });
      bulkDocs.mockImplementation(async (documents, options) => {
        if (isDeletionBatch(documents) && raceFailures < EXPECTED_CONFLICT_RACE_ATTEMPTS) {
          raceFailures += 1;
          if (raceFailures === EXPECTED_CONFLICT_RACE_ATTEMPTS) {
            const revisionId = 'f'.repeat(32);
            await originalBulkDocs(
              [
                {
                  _id: key,
                  _rev: `2-${revisionId}`,
                  _revisions: { start: 2, ids: [revisionId, 'root'] },
                  value: 'racing-value',
                },
              ],
              { new_edits: false },
            );
            await observedChange;
            queuedChange = true;
          }
          return documents.map(createConflictError);
        }
        return originalBulkDocs(documents, options);
      });

      await storage.initialize();
      await vi.waitFor(
        async () => {
          const document = await db.get(key, { conflicts: true });
          expect(document._conflicts ?? []).toHaveLength(0);
        },
        { timeout: 10_000 },
      );

      expect(raceFailures).toBe(EXPECTED_CONFLICT_RACE_ATTEMPTS);
      expect(queuedChange).toBe(true);
      expect(bulkDocs.mock.calls.filter(([documents]) => isDeletionBatch(documents))).toHaveLength(
        EXPECTED_CONFLICT_RACE_ATTEMPTS + 1,
      );
      storage[Symbol.dispose]();
    }, 30_000);

    it('reports persistent conflict cleanup failures after bounded retries', async () => {
      const key = 'persistent-race';
      await seedConflictLeaves(db, key, 3);
      const storage = new PouchDbStorage(db);
      const originalBulkDocs = db.bulkDocs.bind(db);
      const bulkDocs = vi.spyOn(db, 'bulkDocs');
      const reportFailure = vi.fn();
      const subscription = storage.events$.subscribe((event) => {
        if (event.type === StateOperationEvent.Failure.Type) {
          reportFailure(event);
        }
      });
      bulkDocs.mockImplementation(async (documents, options) => {
        if (isDeletionBatch(documents)) {
          return documents.map(createConflictError);
        }
        return originalBulkDocs(documents, options);
      });

      await storage.initialize();
      await vi.waitFor(() => expect(reportFailure).toHaveBeenCalledOnce(), { timeout: 10_000 });

      expect(bulkDocs.mock.calls.filter(([documents]) => isDeletionBatch(documents))).toHaveLength(
        EXPECTED_CONFLICT_RACE_ATTEMPTS * (EXPECTED_CONFLICT_RETRY_CYCLES + 1),
      );
      subscription.unsubscribe();
      storage[Symbol.dispose]();
    });

    it('cancels a scheduled conflict retry when disposed', async () => {
      const key = 'cancelled-race';
      await seedConflictLeaves(db, key, 3);
      const storage = new PouchDbStorage(db);
      const originalBulkDocs = db.bulkDocs.bind(db);
      const bulkDocs = vi.spyOn(db, 'bulkDocs');
      bulkDocs.mockImplementation(async (documents, options) => {
        if (isDeletionBatch(documents)) {
          return documents.map(createConflictError);
        }
        return originalBulkDocs(documents, options);
      });

      await storage.initialize();
      await vi.waitFor(
        () =>
          expect(
            bulkDocs.mock.calls.filter(([documents]) => isDeletionBatch(documents)),
          ).toHaveLength(EXPECTED_CONFLICT_RACE_ATTEMPTS),
        { timeout: 2_000 },
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
      storage[Symbol.dispose]();
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(bulkDocs.mock.calls.filter(([documents]) => isDeletionBatch(documents))).toHaveLength(
        EXPECTED_CONFLICT_RACE_ATTEMPTS,
      );
    });

    it('converges repeated concurrent writes and deletion after an offline replica reconnects', async () => {
      const localName = `replica-local-${Date.now()}`;
      const remote = PouchDbStorage.CreateDb(`replica-remote-${Date.now()}`);
      const offline = PouchDbStorage.CreateDb(`replica-offline-${Date.now()}`);
      let local = PouchDbStorage.CreateDb(localName);
      let deletionStorage: PouchDbStorage | undefined;
      let reloadedStorage: PouchDbStorage | undefined;
      const appKeys = ['app::remove', 'app::clear', 'app::keep'];
      const outsideKey = 'other::keep';
      let expectedWinners = new Map<string, { revision: string; value: string }>();

      try {
        await local.bulkDocs([
          ...appKeys.map((_id) => ({ _id, value: 'initial' })),
          { _id: outsideKey, value: 'outside-value' },
        ]);
        await local.replicate.to(remote);

        for (let round = 0; round < 2; round += 1) {
          for (const key of appKeys) {
            const localDocument = await local.get(key);
            const remoteDocument = await remote.get(key);
            await local.put({ ...localDocument, value: `local-${round}-${key}` });
            await remote.put({ ...remoteDocument, value: `remote-${round}-${key}` });
          }
          await local.sync(remote, { live: false });

          expectedWinners = new Map();
          for (const key of appKeys) {
            const winner = await local.get(key, { conflicts: true });
            expect(winner._conflicts ?? []).not.toHaveLength(0);
            expectedWinners.set(key, { revision: winner._rev, value: winner.value });
          }

          const storages = [
            new PouchDbStorage(local, { key_prefix: 'app' }),
            new PouchDbStorage(remote, { key_prefix: 'app' }),
          ];
          try {
            await Promise.all(storages.map((storage) => storage.initialize()));
            await vi.waitFor(
              async () => {
                for (const database of [local, remote]) {
                  for (const key of appKeys) {
                    const document = await database.get(key, { conflicts: true });
                    expect(document._conflicts ?? []).toHaveLength(0);
                  }
                }
              },
              { timeout: 10_000 },
            );
          } finally {
            storages.forEach((storage) => {
              storage[Symbol.dispose]();
            });
          }

          for (let syncRound = 0; syncRound < 2; syncRound += 1) {
            await local.sync(remote, { live: false });
            await remote.sync(local, { live: false });
          }
          for (const database of [local, remote]) {
            for (const key of appKeys) {
              const document = await database.get(key, { conflicts: true });
              expect(document._conflicts ?? []).toHaveLength(0);
              expect(document._rev).toBe(expectedWinners.get(key)?.revision);
              expect(document.value).toBe(expectedWinners.get(key)?.value);
            }
          }
        }

        await local.replicate.to(offline);
        for (const key of appKeys) {
          const offlineDocument = await offline.get(key);
          expect(offlineDocument._rev).toBe(expectedWinners.get(key)?.revision);
          expect(offlineDocument.value).toBe(expectedWinners.get(key)?.value);
        }

        deletionStorage = new PouchDbStorage(local, { key_prefix: 'app' });
        await deletionStorage.initialize();
        await expect(deletionStorage.removeItem({ key: 'remove' })).resolves.toMatchObject({
          status: 'success',
        });
        const clearResults = await deletionStorage.clear({ clear_all: false });
        expect(clearResults.map((result) => result.key).sort()).toEqual(
          ['app::clear', 'app::keep'].sort(),
        );
        expect(clearResults.every((result) => result.status === 'success')).toBe(true);
        deletionStorage[Symbol.dispose]();
        deletionStorage = undefined;

        await local.close();
        local = PouchDbStorage.CreateDb(localName);
        reloadedStorage = new PouchDbStorage(local, { key_prefix: 'app' });
        await reloadedStorage.initialize();

        for (let syncRound = 0; syncRound < 2; syncRound += 1) {
          await local.sync(remote, { live: false });
          await remote.sync(local, { live: false });
        }
        await offline.sync(local, { live: false });
        await local.sync(offline, { live: false });
        await offline.sync(local, { live: false });

        for (const database of [local, remote, offline]) {
          for (const key of appKeys) {
            const rows = await database.allDocs({ keys: [key] });
            expect(rows.rows[0]?.value).toHaveProperty('deleted', true);
            await expect(database.get(key, { conflicts: true })).rejects.toMatchObject({
              status: 404,
            });
          }
          const scopedRows = await database.allDocs({
            startkey: 'app::',
            endkey: 'app::\ufff0',
          });
          expect(scopedRows.rows).toHaveLength(0);
          await expect(database.get(outsideKey)).resolves.toMatchObject({
            value: 'outside-value',
          });
        }
      } finally {
        deletionStorage?.[Symbol.dispose]();
        reloadedStorage?.[Symbol.dispose]();
        await Promise.all([local.destroy(), remote.destroy(), offline.destroy()]);
      }
    }, 30_000);

    it('does not skip the next startup page when its cursor is deleted', async () => {
      const prefix = 'page';
      const cursorKey = `${prefix}::099`;
      const conflictKey = `${prefix}::100`;
      await db.bulkDocs(
        Array.from({ length: 100 }, (_value, index) => ({
          _id: `${prefix}::${index.toString().padStart(3, '0')}`,
          value: index,
        })),
      );
      await seedConflictLeaves(db, conflictKey, 2);

      const originalAllDocs = db.allDocs.bind(db);
      const allDocs = vi.spyOn(db, 'allDocs');
      let deletedCursor: string | undefined;
      allDocs.mockImplementationOnce(async (options) => {
        const response = await originalAllDocs(options);
        expect(response.rows).toHaveLength(100);
        const lastRow = response.rows.at(-1);
        if (lastRow) {
          deletedCursor = lastRow.id;
          await db.remove(lastRow.id, lastRow.value.rev);
        }
        return response;
      });

      const storage = new PouchDbStorage(db, { key_prefix: prefix });
      await storage.initialize();
      await vi.waitFor(
        async () => {
          const document = await db.get(conflictKey, { conflicts: true });
          expect(document._conflicts ?? []).toHaveLength(0);
        },
        { timeout: 10_000 },
      );

      expect(deletedCursor).toBe(cursorKey);
      storage[Symbol.dispose]();
    });

    it('replicates deletion tombstones for every live leaf', async () => {
      const key = 'app::deleted';
      const remote = PouchDbStorage.CreateDb(`remote-${Date.now()}`);
      const storage = new PouchDbStorage(db, { key_prefix: 'app' });
      try {
        await seedConflictLeaves(db, key, 3);
        await db.replicate.to(remote);

        await expect(storage.removeItem({ key: 'deleted' })).resolves.toMatchObject({
          status: 'success',
        });
        await db.sync(remote, { live: false });

        const rows = await remote.allDocs({ keys: [key], include_docs: true, conflicts: true });
        expect(rows.rows[0]?.value).toHaveProperty('deleted', true);
        expect(rows.rows[0]?.doc?._conflicts ?? []).toHaveLength(0);
        await expect(remote.get(key)).rejects.toMatchObject({ status: 404 });
      } finally {
        storage[Symbol.dispose]();
        await remote.destroy();
      }
    });

    it('does not impose delete-wins over a later offline edit from a stale replica', async () => {
      const local = PouchDbStorage.CreateDb(`local-${Date.now()}`);
      const stale = PouchDbStorage.CreateDb(`stale-${Date.now()}`);
      try {
        const initial = await local.put({ _id: 'offline-delete', value: 'initial' });
        await local.replicate.to(stale);

        await local.remove('offline-delete', initial.rev);
        const staleDocument = await stale.get('offline-delete');
        await stale.put({ ...staleDocument, value: 'offline edit' });
        await local.replicate.from(stale);

        const winner = await local.get('offline-delete', { conflicts: true });
        const leaves = await local.get('offline-delete', { open_revs: 'all' });
        expect(winner.value).toBe('offline edit');
        expect(winner._conflicts ?? []).toHaveLength(0);
        expect(leaves).toHaveLength(2);
      } finally {
        await local.destroy();
        await stale.destroy();
      }
    });

    it('removes losing leaves through bulk removal and scoped clear only', async () => {
      const storage = new PouchDbStorage(db, { key_prefix: 'app' });
      await seedConflictLeaves(db, 'app::bulk', 3);
      await seedConflictLeaves(db, 'app::clear', 3);
      await seedConflictLeaves(db, 'other::keep', 3);

      await expect(storage.removeItems([{ key: 'bulk' }])).resolves.toMatchObject([
        { status: 'success', key: 'app::bulk' },
      ]);
      await expect(storage.clear({ clear_all: false })).resolves.toMatchObject([
        { status: 'success', key: 'app::clear' },
      ]);

      await expect(db.get('app::bulk')).rejects.toMatchObject({ status: 404 });
      await expect(db.get('app::clear')).rejects.toMatchObject({ status: 404 });
      await expect(db.get('other::keep', { conflicts: true })).resolves.toMatchObject({
        _conflicts: expect.arrayContaining([expect.any(String)]),
      });
      storage[Symbol.dispose]();
    });

    it('splits local deletion calls by serialized payload size', async () => {
      const suffix = 'x'.repeat(4_000);
      const items = Array.from({ length: 250 }, (_value, index) => ({
        key: `${index}-${suffix}`,
        value: index,
      }));
      await db.bulkDocs(items.map(({ key, value }) => ({ _id: key, value })));

      const bulkDocs = vi.spyOn(db, 'bulkDocs');
      const storage = new PouchDbStorage(db);
      const results = await storage.removeItems(items.map(({ key }) => ({ key })));

      expect(results).toHaveLength(items.length);
      expect(results.every((result) => result.status === 'success')).toBe(true);
      expect(bulkDocs).toHaveBeenCalledTimes(2);
      storage[Symbol.dispose]();
    });
  });
});
