import type { AllowedValue } from '@equinor/fusion-framework-module-state';
import type { StorageError } from './StorageError.js';

/**
 * Represents a successful storage operation event.
 *
 * @property status - The status of the event, always set to 'success'.
 * @property key - The key associated with the successful storage operation.
 */
export type StorageSuccessResult = {
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
export type StorageErrorResult = {
  status: 'error';
  key?: string;
  error: StorageError;
};

/**
 * Represents the result of a storage operation, which can either be a successful event (`StorageSuccessEvent`)
 * or an error event (`StorageErrorEvent`).
 */
export type StorageResult = StorageSuccessResult | StorageErrorResult;

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
