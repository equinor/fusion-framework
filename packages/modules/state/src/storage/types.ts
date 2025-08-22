import type { AllowedValue } from '@equinor/fusion-framework-module-state';
import type { StorageError } from './StorageError.js';

/**
 * Represents the possible types of events that can occur in a storage system.
 *
 * - `'changed'`: Indicates that the storage content has changed.
 * - `'created'`: Indicates that a new item has been created in storage.
 * - `'updated'`: Indicates that an existing item has been updated in storage.
 * - `'deleted'`: Indicates that an item has been removed from storage.
 */
export type StorageChangeEventType = 'changed' | 'created' | 'updated' | 'deleted';

/**
 * Represents an event that occurs when a storage item changes.
 *
 * @template T - The type of the value allowed in the storage item.
 * @property type - The type of the storage event.
 * @property item - The storage item that was changed.
 */
export type StorageChangeEvent<T extends AllowedValue = AllowedValue> = {
  type: StorageChangeEventType;
  item: StorageItem<T>;
};

/**
 * Handler function type for responding to storage change events.
 *
 * @param event - The storage change event containing details about the change.
 */
export type StorageChangeEventHandler = (event: StorageChangeEvent) => void;

/**
 * A function type for handling storage-related errors.
 *
 * @param error - The `StorageError` instance that occurred during a storage operation.
 */
export type StorageErrorHandler = (error: StorageError) => void;

/**
 * Represents a successful storage operation event.
 *
 * @property status - The status of the event, always set to 'success'.
 * @property key - The key associated with the successful storage operation.
 */
export type StorageSuccessEvent = {
  status: 'success';
  key: string;
};

/**
 * Represents an event that occurs when a storage operation encounters an error.
 *
 * @property status - The status of the event, always set to 'error'.
 * @property key - (Optional) The key associated with the storage operation that failed.
 * @property error - The error object describing the storage failure.
 */
export type StorageErrorEvent = {
  status: 'error';
  key?: string;
  error: StorageError;
};

/**
 * Represents the result of a storage operation, which can either be a successful event (`StorageSuccessEvent`)
 * or an error event (`StorageErrorEvent`).
 */
export type StorageResult = StorageSuccessEvent | StorageErrorEvent;

/**
 * Represents a storage item with a string key and a value of a permitted type.
 *
 * @typeParam T - The type of the value stored, constrained to `AllowedValue`.
 * @property key - The unique identifier for the storage item.
 * @property value - The value associated with the key.
 */
export type StorageItem<T extends AllowedValue = AllowedValue> = {
  key: string;
  value: T;
};
