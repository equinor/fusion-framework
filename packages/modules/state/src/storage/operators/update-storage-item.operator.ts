import type { MonoTypeOperatorFunction, Observable, OperatorFunction } from 'rxjs';
import { distinctUntilChanged, mergeMap, scan, startWith } from 'rxjs/operators';

import type { AllowedValue } from '@equinor/fusion-framework-module-state';

import type { StorageItem, StorageChangeEvent } from '../types.js';

import isEqual from 'fast-deep-equal';

/**
 * Updates a storage item if its key matches the key in the provided change event.
 *
 * @template T - The type of the value allowed in the storage item.
 * @param item - The current storage item to potentially update.
 * @param change - The storage change event containing the updated item.
 * @returns The updated storage item if the keys match; otherwise, returns the original item.
 */
function updateItem<T extends AllowedValue>(
  item: StorageItem<T> | null,
  change: StorageChangeEvent,
): StorageItem<T> | null {
  // Check if the item key matches the change event key
  if (item !== null && item.key !== change.item.key) {
    return item;
  }
  if (change.type === 'deleted') {
    return null; // If the change type is 'deleted', return null
  }
  return change.item as StorageItem<T>;
}

/**
 * Creates an RxJS operator that applies a series of `StorageChangeEvent`s to an initial `IStorageItem<T>`,
 * emitting the updated storage item after each change.
 *
 * @template T - The type of the value allowed in the storage item.
 * @param initial - The initial storage item to start applying changes to.
 * @returns An RxJS operator function that takes an observable of `StorageChangeEvent`s and emits the updated `IStorageItem<T>` after each event.
 */
function applyItemChanges<T extends AllowedValue>(
  initial: StorageItem<T> | null,
): OperatorFunction<StorageChangeEvent, StorageItem<T> | null> {
  return (source: Observable<StorageChangeEvent>): Observable<StorageItem<T> | null> => {
    return source.pipe(
      scan(updateItem, initial),
      startWith(initial),
      distinctUntilChanged(isEqual),
    );
  };
}

/**
 * Operator function that updates a storage item based on a stream of storage change events.
 *
 * @typeParam T - The type of the value allowed in the storage item.
 * @param changes$ - An observable stream of `StorageChangeEvent` objects representing changes to apply.
 * @returns A MonoTypeOperatorFunction that emits updated `IStorageItem<T>` values as changes occur.
 */
export function updateStorageItem<T extends AllowedValue>(
  changes$: Observable<StorageChangeEvent>,
): MonoTypeOperatorFunction<StorageItem<T> | null> {
  return (source: Observable<StorageItem<T> | null>) => {
    return source.pipe(mergeMap((initial) => applyItemChanges<T>(initial)(changes$)));
  };
}
