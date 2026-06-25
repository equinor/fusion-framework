import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PouchDbStorage } from '../storage/PouchDbStorage.js';
import { StateOperationEvent, StateChangeEvent, type StateEventType } from '../events/index.js';

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
    } catch (error) {
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
});
