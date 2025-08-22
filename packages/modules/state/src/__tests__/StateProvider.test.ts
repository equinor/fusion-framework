import { describe, it, expect, vi, beforeEach } from 'vitest';
import { from } from 'rxjs';

import { type StateItem, StateProvider } from '../index.js';

import type { StorageItem } from '../storage/index.js';

import { MockStorage } from './storage.mock.js';

describe('StateProvider', () => {
  let storage: MockStorage;
  let provider: StateProvider;

  beforeEach(() => {
    storage = new MockStorage();
    provider = new StateProvider({ storage });
  });

  describe('storeItem', () => {
    it('should store an item', async () => {
      const item = { key: 'foo', value: 'bar' };
      const spy = vi.spyOn(storage, 'putItem');
      await expect(provider.storeItem(item)).resolves.toEqual({
        status: 'success',
        key: item.key,
      });
      expect(spy).toHaveBeenCalledWith(item);
      const stored = await storage.item(item.key);
      expect(stored).toEqual(item);
    });
  });

  describe('storeItems', () => {
    it('should store items in bulk with `putItem` when `putItems` is not available', async () => {
      const items = [
        { key: 'foo', value: 1 },
        { key: 'bar', value: 2 },
      ];
      expect('putItems' in storage).toBe(false);
      const spy = vi.spyOn(storage, 'putItem');
      await expect(provider.storeItems(items)).resolves.toEqual([
        { status: 'success', key: items[0].key },
        { status: 'success', key: items[1].key },
      ]);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(1, items[0]);
      expect(spy).toHaveBeenNthCalledWith(2, items[1]);
    });

    it('should store items in bulk with `putItems` when available', async () => {
      const items = [
        { key: 'foo', value: 1 },
        { key: 'bar', value: 2 },
      ];
      const mock_putItems = vi.fn().mockImplementation(async (items: StateItem[]) => {
        for (const item of items) {
          storage.items[item.key] = item;
        }
        return items.map((item) => ({ status: 'success', key: item.key }));
      });
      // @ts-ignore - mock implementation
      storage.putItems = mock_putItems;
      await expect(provider.storeItems(items)).resolves.toEqual([
        { status: 'success', key: items[0].key },
        { status: 'success', key: items[1].key },
      ]);
    });
  });

  describe('removeItem', () => {
    it('should remove an item', async () => {
      storage.items = {
        foo: { key: 'foo', value: 1 },
        bar: { key: 'bar', value: 2 },
      };
      const spy = vi.spyOn(storage, 'removeItem');
      const item = { ...storage.items.foo };
      await expect(provider.removeItem(item)).resolves.toMatchObject({
        status: 'success',
        key: item.key,
      });
      expect(spy).toHaveBeenCalledWith(item);
    });
  });

  describe('removeItems', () => {
    it('should remove items in bulk with `removeItem` when `removeItems` is not available', async () => {
      const items = [
        { key: 'foo', value: 1 },
        { key: 'bar', value: 2 },
      ];
      expect('removeItems' in storage).toBe(false);

      const mock_removeItem = vi.fn().mockImplementation((item) => {
        delete storage.items[item.key];
        return Promise.resolve({ status: 'success', key: item.key });
      });
      // @ts-ignore - mock implementation
      storage.removeItem = mock_removeItem;
      await expect(provider.removeItems(items)).resolves.toEqual([
        { status: 'success', key: items[0].key },
        { status: 'success', key: items[1].key },
      ]);
      expect(mock_removeItem).toHaveBeenCalledTimes(2);
      expect(mock_removeItem).toHaveBeenNthCalledWith(1, items[0]);
      expect(mock_removeItem).toHaveBeenNthCalledWith(2, items[1]);
    });

    it('should remove items in bulk with `removeItems` when available', async () => {
      const items = [
        { key: 'foo', value: 1 },
        { key: 'bar', value: 2 },
      ];
      const mock_removeItems = vi.fn().mockImplementation(async (items: StateItem[]) => {
        for (const item of items) {
          delete storage.items[item.key];
        }
        return items.map((item) => ({ status: 'success', key: item.key }));
      });
      // @ts-ignore - mock implementation
      storage.removeItems = mock_removeItems;
      await expect(provider.removeItems(items)).resolves.toEqual([
        { status: 'success', key: items[0].key },
        { status: 'success', key: items[1].key },
      ]);
      expect(mock_removeItems).toHaveBeenCalledTimes(1);
      expect(mock_removeItems).toHaveBeenCalledWith(items);
    });
  });

  describe('observeItem', () => {
    it('should emit value without updates when observing an item', async () => {
      storage.items = { foo: { key: 'foo', value: 1 } };
      const result: Array<StorageItem | null> = [];
      const sub = from(provider.observeItem('foo')).subscribe((item) => {
        result.push(item);
      });
      await Promise.resolve();
      expect(result).toEqual([{ key: 'foo', value: 1 }]);
      sub.unsubscribe();
    });

    it('should be able to observe an item with updates', async () => {
      storage.items = { foo: { key: 'foo', value: 1 } };
      const result: Array<StorageItem | null> = [];
      const sub = from(provider.observeItem('foo')).subscribe((item) => {
        result.push(item);
      });
      await Promise.resolve();
      await provider.storeItem({ key: 'foo', value: 3 });
      await provider.storeItem({ key: 'foo', value: 2 });
      await provider.storeItem({ key: 'foobar', value: 3 });
      await provider.removeItem({ key: 'foo' });
      await provider.storeItem({ key: 'foo', value: -1 });
      expect(result).toEqual([
        { key: 'foo', value: 1 },
        { key: 'foo', value: 3 },
        { key: 'foo', value: 2 },
        null,
        { key: 'foo', value: -1 },
      ]);
      sub.unsubscribe();
    });
  });

  describe('observeItems', () => {
    it('should emit value without updates when observing multiple items', async () => {
      storage.items = { foo: { key: 'foo', value: 1 }, bar: { key: 'bar', value: 2 } };
      const result: Array<Array<StorageItem | null>> = [];
      const sub = from(provider.observeItems()).subscribe((items) => {
        result.push(items);
      });
      await Promise.resolve();
      expect(result.length).toBe(1);
      expect(result).toEqual([
        [
          { key: 'foo', value: 1 },
          { key: 'bar', value: 2 },
        ],
      ]);
      sub.unsubscribe();
    });

    it('should emit value with updates when observing multiple items', async () => {
      storage.items = { foo: { key: 'foo', value: 1 }, bar: { key: 'bar', value: 2 } };
      const result: Array<Array<StorageItem | null>> = [];
      const sub = from(provider.observeItems()).subscribe((items) => {
        result.push(items);
      });
      await Promise.resolve();
      expect(result[result.length - 1]).toEqual([
        { key: 'foo', value: 1 },
        { key: 'bar', value: 2 },
      ]);
      await provider.storeItem({ key: 'foo', value: 3 });
      expect(result[result.length - 1]).toEqual([
        { key: 'foo', value: 3 },
        { key: 'bar', value: 2 },
      ]);
      await provider.storeItems([
        { key: 'bar', value: 4 },
        { key: 'foobar', value: false },
      ]);
      expect(result[result.length - 1]).toEqual([
        { key: 'foo', value: 3 },
        { key: 'bar', value: 4 },
        { key: 'foobar', value: false },
      ]);
      const numberOfResults = result.length;
      await provider.storeItems([
        { key: 'bar', value: 4 },
        { key: 'foobar', value: false },
      ]);
      expect(result.length).toBe(numberOfResults);
      sub.unsubscribe();
    });
  });

  describe('getItem', () => {
    it('should retrieve an existing item', async () => {
      storage.items = { foo: { key: 'foo', value: 'bar' } };
      const spy = vi.spyOn(storage, 'item');

      const result = await provider.getItem('foo');

      expect(result).toEqual({ key: 'foo', value: 'bar' });
      expect(spy).toHaveBeenCalledWith('foo');
    });

    it('should return null for non-existent item', async () => {
      storage.items = {};
      const result = await provider.getItem('nonexistent');

      expect(result).toBe(null);
    });

    it('should preserve type information', async () => {
      storage.items = {
        str: { key: 'str', value: 'text' },
        num: { key: 'num', value: 42 },
        obj: { key: 'obj', value: { nested: true } },
      };

      const strResult = await provider.getItem<string>('str');
      const numResult = await provider.getItem<number>('num');
      const objResult = await provider.getItem<{ nested: boolean }>('obj');

      expect(strResult?.value).toBe('text');
      expect(numResult?.value).toBe(42);
      expect(objResult?.value).toEqual({ nested: true });
    });
  });

  describe('getAllItems', () => {
    it('should retrieve all items', async () => {
      const items = [
        { key: 'user-preference', value: { theme: 'dark', language: 'en' } },
        { key: 'app-settings', value: { notifications: true, autoSave: false } },
      ];
      await provider.storeItems(items);
      const result = await provider.getAllItems();
      expect(result.items).toHaveLength(2);
      expect(result.items.map((item) => item.key)).toContain('user-preference');
      expect(result.items.map((item) => item.key)).toContain('app-settings');
    });

    it('should retrieve items with options', async () => {
      const items = [
        { key: 'user-preference', value: { theme: 'dark', language: 'en' } },
        { key: 'app-settings', value: { notifications: true, autoSave: false } },
        { key: 'feature.flag1', value: { enabled: true } },
        { key: 'feature.flag2', value: { enabled: false } },
      ];
      await provider.storeItems(items);
      const result = await provider.getAllItems({ limit: 2, skip: 1 });
      expect(result.items).toHaveLength(2);
    });

    it('should retrieve items with skip only (no limit)', async () => {
      const items = [
        { key: 'user-preference', value: { theme: 'dark', language: 'en' } },
        { key: 'app-settings', value: { notifications: true, autoSave: false } },
        { key: 'feature.flag1', value: { enabled: true } },
      ];
      await provider.storeItems(items);
      const result = await provider.getAllItems({ skip: 1 });
      expect(result.items).toHaveLength(2);
    });

    it('should return empty array when no items exist', async () => {
      const result = await provider.getAllItems();
      expect(result.items).toHaveLength(0);
    });

    it('should filter items by prefix', async () => {
      const items = [
        { key: 'user-preference', value: { theme: 'dark', language: 'en' } },
        { key: 'app-settings', value: { notifications: true, autoSave: false } },
        { key: 'feature.flag1', value: { enabled: true } },
        { key: 'feature.flag2', value: { enabled: false } },
        { key: 'config.system', value: { debug: true } },
      ];
      await provider.storeItems(items);

      const featureResult = await provider.getAllItems({ prefix: 'feature.' });
      expect(featureResult.items).toHaveLength(2);
      expect(featureResult.items.map((item) => item.key)).toEqual([
        'feature.flag1',
        'feature.flag2',
      ]);

      const configResult = await provider.getAllItems({ prefix: 'config.' });
      expect(configResult.items).toHaveLength(1);
      expect(configResult.items[0].key).toBe('config.system');
    });
  });

  describe('clear', () => {
    it('should clear all items using storage.clear when available', async () => {
      storage.items = {
        foo: { key: 'foo', value: 1 },
        bar: { key: 'bar', value: 2 },
      };

      const mockClear = vi.fn().mockResolvedValue([
        { status: 'success', key: 'foo' },
        { status: 'success', key: 'bar' },
      ]);
      // @ts-ignore - mock implementation
      storage.clear = mockClear;

      const result = await provider.clear();

      expect(mockClear).toHaveBeenCalledWith();
      expect(result).toEqual([
        { status: 'success', key: 'foo' },
        { status: 'success', key: 'bar' },
      ]);
    });

    it('should clear all items individually when storage.clear is not available', async () => {
      storage.items = {
        foo: { key: 'foo', value: 1 },
        bar: { key: 'bar', value: 2 },
      };
      const spy = vi.spyOn(storage, 'removeItem');

      const result = await provider.clear();

      expect(spy).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { status: 'success', key: 'foo' },
        { status: 'success', key: 'bar' },
      ]);
      expect(storage.items).toEqual({});
    });

    it('should handle errors during individual removal', async () => {
      storage.items = {
        foo: { key: 'foo', value: 1 },
        bar: { key: 'bar', value: 2 },
      };

      const mockRemoveItem = vi
        .fn()
        .mockResolvedValueOnce({ status: 'success', key: 'foo' })
        .mockRejectedValueOnce(new Error('Remove failed'));

      storage.removeItem = mockRemoveItem;

      const result = await provider.clear();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ status: 'success', key: 'foo' });
      expect(result[1]).toEqual({
        status: 'error',
        error: expect.any(Error),
      });
    });

    it('should return empty array when no items to clear', async () => {
      storage.items = {};

      const result = await provider.clear();

      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should propagate storage errors in storeItem', async () => {
      const error = new Error('Storage failed');
      vi.spyOn(storage, 'putItem').mockRejectedValue(error);

      await expect(provider.storeItem({ key: 'foo', value: 'bar' })).rejects.toThrow(
        'Storage failed',
      );
    });

    it('should propagate storage errors in removeItem', async () => {
      const error = new Error('Remove failed');
      vi.spyOn(storage, 'removeItem').mockRejectedValue(error);

      await expect(provider.removeItem({ key: 'foo' })).rejects.toThrow('Remove failed');
    });

    it('should propagate storage errors in getItem', async () => {
      const error = new Error('Retrieval failed');
      vi.spyOn(storage, 'item').mockRejectedValue(error);

      await expect(provider.getItem('foo')).rejects.toThrow('Retrieval failed');
    });

    it('should propagate storage errors in getAllItems', async () => {
      const error = new Error('Retrieval failed');
      vi.spyOn(storage, 'allItems').mockRejectedValue(error);

      await expect(provider.getAllItems()).rejects.toThrow('Retrieval failed');
    });
  });

  describe('edge cases', () => {
    it('should handle null values in storage', async () => {
      const item = { key: 'null-value', value: null };
      await provider.storeItem(item);

      const retrieved = await provider.getItem('null-value');
      expect(retrieved).toEqual(item);
    });

    it('should handle undefined values in storage', async () => {
      const item = { key: 'undefined-value', value: undefined };
      await provider.storeItem(item);

      const retrieved = await provider.getItem('undefined-value');
      expect(retrieved).toEqual(item);
    });

    it('should handle complex object values', async () => {
      const complexValue = {
        nested: { deeply: { value: 'test' } },
        array: [1, 2, { inner: true }],
        date: new Date('2023-01-01'),
      };
      const item = { key: 'complex', value: complexValue };
      await provider.storeItem(item);

      const retrieved = await provider.getItem('complex');
      expect(retrieved?.value).toEqual(complexValue);
    });

    it('should observe non-existent item initially returning null', async () => {
      const result: Array<StateItem | null> = [];
      const sub = provider.observeItem('nonexistent').subscribe((item) => {
        result.push(item);
      });

      await Promise.resolve(); // Wait for subscription

      expect(result).toEqual([null]);
      sub.unsubscribe();
    });

    it('should observe items initially returning empty array', async () => {
      storage.items = {};
      const result: Array<StateItem[]> = [];
      const sub = provider.observeItems().subscribe((items) => {
        result.push(items);
      });

      await Promise.resolve(); // Wait for subscription

      expect(result).toEqual([[]]);
      sub.unsubscribe();
    });
  });

  describe('observable lifecycle', () => {
    it('should handle multiple simultaneous observers', async () => {
      storage.items = { foo: { key: 'foo', value: 1 } };

      const results1: Array<StateItem | null> = [];
      const results2: Array<StateItem | null> = [];

      const sub1 = provider.observeItem('foo').subscribe((item) => results1.push(item));
      const sub2 = provider.observeItem('foo').subscribe((item) => results2.push(item));

      await Promise.resolve();
      await provider.storeItem({ key: 'foo', value: 2 });

      expect(results1).toEqual([
        { key: 'foo', value: 1 },
        { key: 'foo', value: 2 },
      ]);
      expect(results2).toEqual([
        { key: 'foo', value: 1 },
        { key: 'foo', value: 2 },
      ]);

      sub1.unsubscribe();
      sub2.unsubscribe();
    });

    it('should not emit after unsubscription', async () => {
      storage.items = { foo: { key: 'foo', value: 1 } };

      const results: Array<StateItem | null> = [];
      const sub = provider.observeItem('foo').subscribe((item) => results.push(item));

      await Promise.resolve();
      sub.unsubscribe();

      await provider.storeItem({ key: 'foo', value: 2 });

      expect(results).toEqual([{ key: 'foo', value: 1 }]);
    });
  });
});
