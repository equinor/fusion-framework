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

/**
 * Represents the result of a replication operation for a single batch of changes.
 *
 * @template T - The type of content being replicated
 */
export interface SyncReplicationResult<T extends AllowedValue = AllowedValue> {
  /** Array of items involved in the replication */
  items: Array<StorageItem<T> & { _id?: string }>;
  /** Number of documents successfully written */
  item_written: number;
  /** Number of documents read during replication */
  item_read: number;
  /** Number of document write failures during replication */
  items_write_failures?: number;
  /** Time when replication started */
  start_time: Date;
  /** Whether the replication operation was successful */
  ok: boolean;
  /** Array of errors encountered during replication */
  errors: unknown[];
}

/**
 * Represents the result of a sync operation in a specific direction.
 *
 * @template T - The type of content being synced
 */
export interface SyncResult<T extends AllowedValue = AllowedValue> {
  /** Direction of the sync operation */
  direction: 'push' | 'pull';
  /** Details about the replication operation */
  change: SyncReplicationResult<T>;
}

export type StateSyncStatus = 'active' | 'paused' | 'unknown';
