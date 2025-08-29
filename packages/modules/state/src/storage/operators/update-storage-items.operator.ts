import type { MonoTypeOperatorFunction, Observable, OperatorFunction } from 'rxjs';
import { distinctUntilChanged, mergeMap, scan, startWith } from 'rxjs/operators';

import type { AllowedValue } from '@equinor/fusion-framework-module-state';

import type { StorageItem, StorageChangeEvent } from '../types.js';

import isEqual from 'fast-deep-equal';

/**
 * Updates an array of storage items based on a storage change event.
 *
 * - If the change event type is `'deleted'`, removes the item with the matching key.
 * - If the item exists, updates it with the new value from the change event.
 * - If the item does not exist, appends the new item to the array.
 *
 * @typeParam T - The type of the allowed value for the storage item.
 * @param items - The current array of storage items.
 * @param change - The storage change event describing the modification.
 * @returns A new array of storage items reflecting the change.
 */
function updateItems<T extends AllowedValue>(
  items: StorageItem<T>[],
  change: StorageChangeEvent,
): StorageItem<T>[] {
  if (change.type === 'deleted') {
    // Remove the item with the deleted key
    return items.filter((i) => i.key !== change.item.key);
  }
  const idx = items.findIndex((i) => i.key === change.item.key);
  if (idx > -1) {
    // no change
    if (isEqual(items[idx], change.item)) {
      return items;
    }
    // update existing item
    const copy = [...items];
    copy[idx] = change.item as StorageItem<T>;
    return copy;
  }
  // append new item
  return items.concat([change.item as StorageItem<T>]);
}

/**
 * @typeParam T - The type of the allowed value stored in each storage item.
 * @param initial - The initial array of storage items to be updated.
 * @returns An RxJS operator function that takes an observable of `StorageChangeEvent` and emits the updated array of storage items.
 *
 * @example
 * const updatedItems$ = changes$.pipe(applyItemsChanges(initialItems));
 */
function applyItemsChanges<T extends AllowedValue>(
  initial: StorageItem<T>[],
): OperatorFunction<StorageChangeEvent, StorageItem<T>[]> {
  return (source: Observable<StorageChangeEvent>): Observable<StorageItem<T>[]> => {
    return source.pipe(scan(updateItems, initial), startWith(initial), distinctUntilChanged());
  };
}

/**
 * Operator function that applies a stream of storage change events to an observable array of storage items.
 *
 * @template T - The type of the allowed value stored in each storage item.
 * @param changes$ - An observable stream of storage change events to be applied.
 * @returns A MonoTypeOperatorFunction that emits updated arrays of storage items after applying the changes.
 */
export function updateStorageItems<T extends AllowedValue>(
  changes$: Observable<StorageChangeEvent>,
): MonoTypeOperatorFunction<StorageItem<T>[]> {
  return (source: Observable<StorageItem<T>[]>) => {
    return source.pipe(mergeMap((initial) => applyItemsChanges<T>(initial)(changes$)));
  };
}
