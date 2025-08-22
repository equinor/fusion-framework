import { describe, it, expect } from 'vitest';
import { of, from, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { updateStorageItem } from '../storage/operators/update-storage-item.operator';
import { updateStorageItems } from '../storage/operators/update-storage-items.operator';

import type { AllowedValue } from '../index.ts';
import type { StorageItem, StorageChangeEvent } from '../storage/index.js';

describe('updateStorageItem', () => {
  const initial: StorageItem<AllowedValue> = { key: 'a', value: 'foo' };

  it('should emit initial item if no changes', async () => {
    const changes$ = new Subject<StorageChangeEvent>();
    const result: Array<StorageItem<AllowedValue> | null> = [];

    await new Promise<void>((resolve) => {
      of(initial)
        .pipe(updateStorageItem(changes$), take(1))
        .subscribe({
          next: (item) => result.push(item),
          complete: resolve,
        });
    });

    expect(result).toEqual([initial]);
  });

  it('should update the item if key matches', async () => {
    const changes$ = of<StorageChangeEvent>({
      type: 'updated',
      item: { key: 'a', value: 'bar' },
    });
    const result: Array<StorageItem<AllowedValue> | null> = [];

    await new Promise<void>((resolve) => {
      of(initial)
        .pipe(updateStorageItem(changes$))
        .subscribe({
          next: (item) => result.push(item),
          complete: resolve,
        });
    });

    expect(result).toEqual([initial, { key: 'a', value: 'bar' }]);
  });

  it('should not update if key does not match', async () => {
    const changes$ = of<StorageChangeEvent>({
      type: 'updated',
      item: { key: 'b', value: 'baz' },
    });
    const result: Array<StorageItem<AllowedValue> | null> = [];

    await new Promise<void>((resolve) => {
      of(initial)
        .pipe(updateStorageItem(changes$))
        .subscribe({
          next: (item) => result.push(item),
          complete: resolve,
        });
    });

    expect(result).toEqual([initial]);
  });

  it('should remove the item on deleted event if key matches', async () => {
    const changes$ = of<StorageChangeEvent>({
      type: 'deleted',
      item: { key: 'a', value: 'foo' },
    });
    const result: Array<StorageItem<AllowedValue> | null> = [];

    await new Promise<void>((resolve) => {
      of(initial)
        .pipe(updateStorageItem(changes$))
        .subscribe({
          next: (item) => result.push(item),
          complete: resolve,
        });
    });

    expect(result).toEqual([initial, null]);
  });

  it('should not remove the item on deleted event if key does not match', async () => {
    const changes$ = of<StorageChangeEvent>({
      type: 'deleted',
      item: { key: 'b', value: 'foo' },
    });
    const result: Array<StorageItem<AllowedValue> | null> = [];

    await new Promise<void>((resolve) => {
      of(initial)
        .pipe(updateStorageItem(changes$))
        .subscribe({
          next: (item) => result.push(item),
          complete: resolve,
        });
    });

    expect(result).toEqual([initial]);
  });

  it('should handle multiple change events in sequence', async () => {
    const changes$ = from<StorageChangeEvent[]>([
      { type: 'updated', item: { key: 'a', value: 'bar' } },
      { type: 'deleted', item: { key: 'a', value: null } },
    ]);
    const result: Array<StorageItem<AllowedValue> | null> = [];

    await new Promise<void>((resolve) => {
      of(initial)
        .pipe(updateStorageItem(changes$))
        .subscribe({
          next: (item) => result.push(item),
          complete: resolve,
        });
    });

    expect(result).toEqual([initial, { key: 'a', value: 'bar' }, null]);
  });

  it('should work with a Subject as changes$', async () => {
    const changes$ = new Subject<StorageChangeEvent>();
    const result: Array<StorageItem<AllowedValue> | null> = [];

    const sub = of(initial)
      .pipe(updateStorageItem(changes$))
      .subscribe((item) => result.push(item));

    changes$.next({ type: 'updated', item: { key: 'a', value: 'baz' } });
    changes$.next({ type: 'deleted', item: { key: 'a', value: null } });
    changes$.complete();
    sub.unsubscribe();

    expect(result).toEqual([initial, { key: 'a', value: 'baz' }, null]);
  });

  it('should handle null initial value', async () => {
    const changes$ = of<StorageChangeEvent>({
      type: 'updated',
      item: { key: 'a', value: 'foo' },
    });
    const result: Array<StorageItem<AllowedValue> | null> = [];

    await new Promise<void>((resolve) => {
      of(null)
        .pipe(updateStorageItem(changes$))
        .subscribe({
          next: (item) => result.push(item),
          complete: resolve,
        });
    });

    expect(result).toEqual([null, { key: 'a', value: 'foo' }]);
  });
});

describe('updateStorageItems', () => {
  const initial: StorageItem<string>[] = [
    { key: 'a', value: 'foo' },
    { key: 'b', value: 'bar' },
  ];

  it('should emit initial items if no changes', async () => {
    const changes$ = new Subject<StorageChangeEvent>();
    const result: StorageItem<string>[][] = [];

    await new Promise<void>((resolve) => {
      of(initial)
        .pipe(updateStorageItems(changes$), take(1))
        .subscribe({
          next: (items) => result.push(items),
          complete: resolve,
        });
    });

    expect(result).toEqual([initial]);
  });

  it('should update an existing item', async () => {
    const changes$ = of<StorageChangeEvent>({
      type: 'updated',
      item: { key: 'a', value: 'baz' },
    });
    const result: StorageItem<string>[][] = [];

    await new Promise<void>((resolve) => {
      of(initial)
        .pipe(updateStorageItems(changes$))
        .subscribe({
          next: (items) => result.push(items),
          complete: resolve,
        });
    });

    expect(result).toEqual([
      initial,
      [
        { key: 'a', value: 'baz' },
        { key: 'b', value: 'bar' },
      ],
    ]);
  });

  it('should append a new item if key does not exist', async () => {
    const changes$ = of<StorageChangeEvent>({
      type: 'updated',
      item: { key: 'c', value: 'new' },
    });
    const result: StorageItem<string>[][] = [];

    await new Promise<void>((resolve) => {
      of(initial)
        .pipe(updateStorageItems(changes$))
        .subscribe({
          next: (items) => result.push(items),
          complete: resolve,
        });
    });

    expect(result).toEqual([
      initial,
      [
        { key: 'a', value: 'foo' },
        { key: 'b', value: 'bar' },
        { key: 'c', value: 'new' },
      ],
    ]);
  });

  it('should remove an item on deleted event', async () => {
    const changes$ = of<StorageChangeEvent>({
      type: 'deleted',
      item: { key: 'a', value: 'foo' },
    });
    const result: StorageItem<string>[][] = [];

    await new Promise<void>((resolve) => {
      of(initial)
        .pipe(updateStorageItems(changes$))
        .subscribe({
          next: (items) => result.push(items),
          complete: resolve,
        });
    });

    expect(result).toEqual([initial, [{ key: 'b', value: 'bar' }]]);
  });

  it('should handle multiple change events in sequence', async () => {
    const changes$ = from<StorageChangeEvent[]>([
      { type: 'updated', item: { key: 'a', value: 'baz' } },
      { type: 'deleted', item: { key: 'b', value: null } },
      { type: 'updated', item: { key: 'c', value: 'new' } },
    ]);
    const result: StorageItem<string>[][] = [];

    await new Promise<void>((resolve) => {
      of(initial)
        .pipe(updateStorageItems(changes$))
        .subscribe({
          next: (items) => result.push(items),
          complete: resolve,
        });
    });

    expect(result).toEqual([
      initial,
      [
        { key: 'a', value: 'baz' },
        { key: 'b', value: 'bar' },
      ],
      [{ key: 'a', value: 'baz' }],
      [
        { key: 'a', value: 'baz' },
        { key: 'c', value: 'new' },
      ],
    ]);
  });

  it('should work with a Subject as changes$', async () => {
    const changes$ = new Subject<StorageChangeEvent>();
    const result: StorageItem<string>[][] = [];

    const sub = of(initial)
      .pipe(updateStorageItems(changes$))
      .subscribe((items) => result.push(items));

    changes$.next({ type: 'updated', item: { key: 'a', value: 'baz' } });
    changes$.next({ type: 'deleted', item: { key: 'b', value: null } });
    changes$.next({ type: 'updated', item: { key: 'd', value: 'hello' } });
    changes$.complete();
    sub.unsubscribe();

    expect(result).toEqual([
      initial,
      [
        { key: 'a', value: 'baz' },
        { key: 'b', value: 'bar' },
      ],
      [{ key: 'a', value: 'baz' }],
      [
        { key: 'a', value: 'baz' },
        { key: 'd', value: 'hello' },
      ],
    ]);
  });

  it('should not emit if there are no changes', async () => {
    const changes$ = of<StorageChangeEvent>({
      type: 'updated',
      item: { key: 'a', value: 'foo' },
    });
    const result: StorageItem<string>[][] = [];

    await new Promise<void>((resolve) => {
      of(initial)
        .pipe(updateStorageItems(changes$))
        .subscribe({
          next: (items) => result.push(items),
          complete: resolve,
        });
    });

    expect(result).toEqual([initial]);
  });
});
