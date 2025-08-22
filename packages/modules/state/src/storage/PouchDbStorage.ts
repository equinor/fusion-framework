import PouchDB from 'pouchdb';
import { filter, type Observable, Subject } from 'rxjs';

import type { AllowedValue } from '@equinor/fusion-framework-module-state';

import type {
  StorageItem,
  StorageResult,
  StorageChangeEventType,
  StorageChangeEvent,
  StorageChangeEventHandler,
  StorageErrorHandler,
} from './types.js';

import type {
  RetrievedItemsResponse,
  IStorage,
  RetrieveItemsOptions,
} from './Storage.interface.js';
import { StorageError } from './StorageError.js';

const STORAGE_KEY_SEPARATOR = '::';

/**
 * Options for configuring the PouchDbStorage.
 *
 * Extends the standard PouchDB database configuration options and allows
 * specifying an optional key prefix for stored documents.
 *
 * @property key_prefix - Optional string to prefix all storage keys with, useful for namespacing.
 * @see {@link PouchDB.Configuration.DatabaseConfiguration}
 */
export type PouchDbStorageOptions = PouchDB.Configuration.DatabaseConfiguration & {
  key_prefix?: string;
};

/**
 * Type guard to determine if a given response is a PouchDB error.
 *
 * @param res - The response object to check, which can be either a `PouchDB.Core.Response` or a `PouchDB.Core.Error`.
 * @returns `true` if the response is a `PouchDB.Core.Error`, otherwise `false`.
 */
function isPouchDbError(
  res: PouchDB.Core.Response | PouchDB.Core.Error,
): res is PouchDB.Core.Error {
  return !!(res as PouchDB.Core.Error).error;
}

/**
 * Implements the `IStorage` interface using PouchDB as the underlying storage engine.
 *
 * `PouchDbStorage` provides asynchronous methods to interact with a PouchDB database,
 * allowing for storing, retrieving, removing, and clearing items. Each item is stored
 * as a document in the PouchDB database, identified by a unique key.
 *
 * @example
 * ```typescript
 * const storage = new PouchDbStorage('my-database');
 * await storage.setItem({ _id: 'key', value: 'data' });
 * const value = await storage.getItem<string>('key');
 * await storage.removeItem('key');
 * await storage.clear();
 * ```
 *
 * @remarks
 * - Handles errors gracefully by returning `null` for missing items and ignoring not-found errors on removal.
 * - Uses bulk document deletion for efficient clearing of the database.
 *
 * @see {@link https://pouchdb.com/ | PouchDB Documentation}
 */
export class PouchDbStorage implements IStorage, Disposable {
  #db: PouchDB.Database;
  #key_prefix?: string;
  #changes: Subject<StorageChangeEvent> = new Subject();
  #errors: Subject<Error> = new Subject();
  #teardown: Array<VoidFunction> = [
    this.#changes.complete.bind(this.#changes),
    this.#errors.complete.bind(this.#errors),
  ];

  public static CreateDb(
    name: string,
    options?: PouchDB.Configuration.DatabaseConfiguration,
  ): PouchDB.Database {
    return new PouchDB(name, options);
  }

  /**
   * Generates a storage key by optionally prefixing the provided key with a configured key prefix and a separator.
   *
   * @remarks
   * This method is primarily used internally to append the configured key prefix to storage keys.
   *
   * @internal
   * @protected
   * @param key - The base key to be used for storage.
   * @returns The generated key, prefixed with `key_prefix` and a separator if `key_prefix` is defined; otherwise, returns the original key.
   */
  protected _generateKey(key: string): string {
    return this.#key_prefix ? `${this.#key_prefix}${STORAGE_KEY_SEPARATOR}${key}` : key;
  }

  /**
   * Extracts the key from a given identifier string by removing the configured key prefix, if present.
   *
   * If a `key_prefix` is defined in the options and the `id` starts with this prefix followed by the key separator,
   * the method returns the part of the `id` after the prefix. Otherwise, it returns the original `id`.
   *
   * @remarks
   * This method is primarily used internally to remove internal storage prefixes from keys.
   *
   * @internal
   * @protected
   * @param id - The identifier string from which to extract the key.
   * @returns The extracted key without the prefix, or the original `id` if no prefix is found.
   */
  protected _extractKey(id: string): string {
    if (this.#key_prefix) {
      const [prefix, key] = id.split(STORAGE_KEY_SEPARATOR);
      // mismatch of key prefix - return empty string
      if (prefix !== this.#key_prefix || !key) {
        return '';
      }
      return key;
    }
    return id;
  }

  /**
   * Observable stream that emits storage change events.
   *
   * Subscribers can listen to this observable to react to changes in the storage,
   * such as additions, updates, or deletions of data.
   *
   * @returns An observable emitting `StorageChangeEvent` objects whenever the storage changes.
   */
  get change$(): Observable<StorageChangeEvent> {
    return this.#changes.asObservable();
  }

  /**
   * Creates a new instance of the PouchDbStorage class.
   *
   * @param name - The name of the PouchDB database to connect to or create.
   * @param options - Optional configuration options for the storage instance.
   */
  constructor(name_or_instance: string | PouchDB.Database, options?: PouchDbStorageOptions) {
    const { key_prefix, ...db_options } = options ?? {};
    this.#key_prefix = key_prefix;
    if (typeof name_or_instance === 'string') {
      this.#db = new PouchDB(name_or_instance, {
        auto_compaction: true,
        ...db_options,
      });
    } else {
      this.#db = name_or_instance;
    }
  }

  /**
   * Subscribes to storage adapter events such as 'error', 'changed', 'created', 'updated', or 'deleted'.
   *
   * @note `changed` will trigger on any change to the stored items, including creation, update, and deletion.
   *
   * @param type - The type of event to listen for. Can be one of: 'error', 'changed', 'created', 'updated', or 'deleted'.
   * @param callback - A function to be called when the specified event occurs. Receives an event object as its argument.
   * @returns A function that, when called, unsubscribes from the event.
   */
  public on(type: StorageChangeEventType, callback: StorageChangeEventHandler): VoidFunction {
    switch (type) {
      case 'changed': {
        const subscription = this.#changes.subscribe(callback);
        return () => subscription.unsubscribe();
      }
      case 'created':
      case 'updated':
      case 'deleted': {
        const subscription = this.#changes
          .pipe(filter((change) => change.type === type))
          .subscribe(callback);
        return () => subscription.unsubscribe();
      }
    }
  }

  /**
   * Registers a callback to be invoked whenever a storage error occurs.
   *
   * @param callback - A function that will be called with a `StorageError` object when an error is emitted.
   * @returns A function that can be called to unsubscribe the callback.
   */
  public onError(callback: StorageErrorHandler): VoidFunction {
    const subscription = this.#errors.subscribe(callback);
    return () => subscription.unsubscribe();
  }

  /**
   * Initializes the storage adapter by subscribing to changes in the underlying database.
   * This method should be called before performing any operations that depend on change tracking.
   *
   * @returns A promise that resolves when initialization is complete.
   */
  public async initialize(): Promise<void> {
    this._subscribeToDb();
  }

  /**
   * Subscribes to live changes in the PouchDB database and emits change events.
   *
   * Sets up a live changes feed on the underlying PouchDB instance, filtering documents
   * by the configured key prefix if specified. For each change, emits an event with the
   * item's key and value, and determines the type of change ('created', 'updated', or 'deleted').
   * Also handles completion and error events, and ensures proper teardown by cancelling
   * the changes feed when necessary.
   *
   * @protected
   */
  protected _subscribeToDb(): void {
    // Subscribe to live changes in the PouchDB database
    const changes = this.#db.changes({
      since: 'now',
      live: true,
      include_docs: true,
      filter: (doc) => {
        if (this.#key_prefix) {
          return doc._id.startsWith(this._generateKey(''));
        }
        return true;
      },
    });

    // Handle document changes
    changes.on('change', (change: PouchDB.Core.ChangesResponseChange<Record<string, unknown>>) => {
      // Skip if document is undefined (shouldn't happen but defensive programming)
      if (!change.doc) {
        return;
      }

      // Extract value from the document if it exists
      const { _id, _rev, value } = change.doc;
      const key = this._extractKey(_id);

      // if no key resolved, skip change
      if (!key) {
        return;
      }

      // Queue change event
      this.#changes.next({
        item: {
          key,
          value: (value as AllowedValue) ?? null,
        },
        type: change.deleted ? 'deleted' : _rev.startsWith('1-') ? 'created' : 'updated',
      });
    });

    // Close change and error streams when the database is closed
    changes.on('complete', () => {
      this.#changes.complete();
      this.#errors.complete();
    });

    // Handle errors
    changes.on('error', (error: Error) => {
      this.#errors.next(error);
    });

    // Ensure change handling is properly torn down when this instance is disposed
    this.#teardown.push(() => changes.cancel());
  }

  /**
   * Removes all documents from the storage by marking them as deleted.
   *
   * This method retrieves all documents, creates deletion operations for each,
   * and executes them in bulk. If there are no documents to delete, it returns an empty array.
   *
   * @remarks
   * This method uses the {PouchDbStorage._allItems} which will retrieve all documents from the storage,
   * but if `key_prefix` is set, it will only delete documents that match the prefix.
   *
   * @returns {Promise<StorageResult[]>} A promise that resolves to an array of results for each deletion operation.
   */
  public async clear(args: { clear_all: boolean }): Promise<StorageResult[]> {
    // Retrieve all documents from the storage - index only
    const allDocs = await this._allItems({ ignore_scope: args.clear_all });

    // No documents found - early return
    if (!allDocs.rows.length) {
      return [];
    }

    // Mark all retrieved documents for deletion
    const deletions = allDocs.rows.map((row) => ({
      _id: row.id,
      _rev: row.value.rev,
      _deleted: true,
    }));

    return this._executeBulk(deletions);
  }

  /**
   * Retrieves an item from the storage by its key.
   *
   * @template T - The type of the stored value, constrained to `AllowedValue`.
   * @param key - The key identifying the item to retrieve.
   * @returns A promise that resolves to the storage item containing the key and value,
   *          or `null` if the item does not exist.
   * @throws {StorageError} If the retrieval fails for any reason.
   */
  public async item<T extends AllowedValue>(key: string): Promise<StorageItem<T> | null> {
    try {
      const id = this._generateKey(key);
      const result = await this.#db.get<{ value: T }>(id);
      return {
        key: this._extractKey(result._id),
        value: result.value,
      };
    } catch (e) {
      if ((e as PouchDB.Core.Error).status === 404) {
        return null;
      }
      throw new StorageError(`Failed to get item ${key}`, { cause: e });
    }
  }

  /**
   * Retrieves all items from the storage.
   *
   * @remarks
   * This method fetches all items stored in the database and returns them as an array.
   * Will internally call the `_allItems` method with the appropriate parameters.
   *
   * @note
   * Pagination is supported, but poor performance.
   *
   * @typeParam T - The type of the value stored in each item, constrained by `AllowedValue`.
   * @returns A promise that resolves to an array of storage items, each containing a key and its associated value.
   * @throws {StorageError} If retrieval of items fails.
   */
  public async allItems<T extends AllowedValue>(
    options?: RetrieveItemsOptions,
  ): Promise<RetrievedItemsResponse<T>> {
    try {
      const response = await this._allItems<T>({ include_docs: true, ...options });
      const items = response.rows
        .filter((row): row is typeof row & { doc: { value: T } } => !!row.doc)
        .map((row) => ({
          key: this._extractKey(row.id),
          value: row.doc.value,
        }));
      return {
        offset: response.offset ?? 0,
        total_count: response.total_rows,
        items,
      };
    } catch (error) {
      throw new StorageError('Failed to retrieve all items', { cause: error });
    }
  }

  /**
   * Stores or updates an item in the PouchDB database.
   *
   * If the item already exists, it updates the existing document with the new value,
   * preserving the document's revision. If the item does not exist, it creates a new document.
   *
   * @param item - The storage item to be saved or updated.
   * @returns A promise that resolves to a `StorageResult` indicating the outcome of the operation.
   * @throws {StorageError} If the operation fails, a `StorageError` is thrown with the underlying cause.
   */
  public async putItem(item: StorageItem): Promise<StorageResult> {
    try {
      const key = this._generateKey(item.key);
      // Check if the document already exists, ensure we update the last revision
      const existingDoc = await this.#db.get(key).catch((e) => {
        return { _id: key };
      });

      const result = await this.#db.put({ ...existingDoc, value: item.value });

      // Validate the result
      if (!result.ok) {
        return {
          status: 'error',
          key: result.id,
          error: new Error('Invalid result', { cause: result }),
        };
      }
      return {
        status: 'success',
        key: result.id,
      };
    } catch (e) {
      throw new StorageError(`Failed to put item ${item.key}`, { cause: e });
    }
  }

  /**
   * Stores multiple items in the storage in a single bulk operation.
   *
   * @param items - An array of items to be stored, each implementing the `IStorageItem` interface.
   * @returns A promise that resolves to an array of `StorageResult` objects, indicating the result of each storage operation.
   * @throws {StorageError} If the bulk operation fails.
   *
   * @remarks
   * This method performs a bulk update, which is generally more efficient than storing items individually.
   */
  public async putItems(items: StorageItem[]): Promise<StorageResult[]> {
    try {
      return this._executeBulk(
        items.map((item) => ({
          _id: this._generateKey(item.key),
          value: item.value,
        })),
      );
    } catch (error) {
      throw new StorageError('Failed to put items', { cause: error });
    }
  }

  /**
   * Removes an item from the PouchDB storage by its key.
   *
   * @param item - An object containing the key of the item to remove.
   * @returns A promise that resolves to a `StorageResult` indicating the outcome of the removal operation.
   * @throws {StorageError} If the removal fails due to an underlying error.
   */
  public async removeItem(item: Pick<StorageItem, 'key'>): Promise<StorageResult> {
    try {
      const key = this._generateKey(item.key);
      const doc = await this.#db.get(key);
      const result = await this.#db.remove(doc);
      if (!result.ok) {
        return {
          status: 'error',
          key: result.id,
          error: new Error('Failed to remove item'),
        };
      }
      return {
        status: 'success',
        key: result.id,
      };
    } catch (e) {
      throw new StorageError(`Failed to remove item ${item.key}`, { cause: e });
    }
  }

  /**
   * Removes multiple items from the storage by marking them as deleted.
   *
   * @remarks
   * This method will execute a bulk operation to remove multiple items from the storage.
   *
   * @param items - An array of objects containing the `key` property of each item to be removed.
   * @returns A promise that resolves to an array of `StorageResult` objects indicating the result of each removal operation.
   * @throws {StorageError} If the removal operation fails.
   */
  public async removeItems(items: Pick<StorageItem, 'key'>[]): Promise<StorageResult[]> {
    if (!items.length) {
      return Promise.resolve([]);
    }
    try {
      return this._executeBulk(
        items.map((item) => ({
          _id: this._generateKey(item.key),
          _deleted: true,
        })),
      );
    } catch (error) {
      throw new StorageError('Failed to remove items', { cause: error });
    }
  }

  /**
   * Retrieves all items from the PouchDB database, optionally including document contents.
   *
   * @internal
   * internal helper function to retrieve all items from the database.
   * if `include_docs` is true, the full document contents will be included in the response,
   * else only the document IDs will be included (useful for deletion).
   *
   * @template T - The type of the value stored in each document.
   * @param include_docs - Whether to include the full document contents in the response.
   * @returns A promise that resolves to a PouchDB `AllDocsResponse` containing documents with values of type `T`.
   */
  protected async _allItems<T extends AllowedValue>(args?: {
    include_docs?: boolean;
    ignore_scope?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<PouchDB.Core.AllDocsResponse<{ value: T }>> {
    const { include_docs, ignore_scope, limit, skip } = args || {};
    // determine if the request should include the scope prefix
    const include_scope = !ignore_scope && this.#key_prefix;

    // Build the options for the allDocs query based on the include_scope flag
    const options = include_scope
      ? ({
          startkey: this._generateKey(''),
          endkey: this._generateKey('\ufff0'),
        } satisfies PouchDB.Core.AllDocsWithinRangeOptions)
      : undefined;

    return this.#db.allDocs<{ value: T }>({ include_docs, limit, skip, ...options });
  }

  /**
   * Executes a bulk operation on the underlying PouchDB database using the `bulkDocs` method.
   *
   * @remarks
   * Internal helper function to execute a bulk operation on the database.
   * Will resolve to an array of `StorageResult` objects for convenience.
   *
   * @internal
   * @protected
   * @param args - The arguments to pass to PouchDB's `bulkDocs` method.
   * @returns A promise that resolves to an array of `StorageResult` objects, each representing the outcome of an individual document operation.
   *
   * Each result will have a `status` of either `'success'` or `'error'`. In case of an error,
   * the result will include an `error` property containing a `StorageError` instance with additional context.
   */
  protected async _executeBulk(
    ...args: Parameters<PouchDB.Database['bulkDocs']>
  ): Promise<StorageResult[]> {
    const result = await this.#db.bulkDocs(...args);

    return result.map((res) => {
      // If the result is an error, we create a StorageError with the message and cause.
      if (isPouchDbError(res)) {
        return {
          status: 'error',
          key: res.id ?? 'unknown',
          error: new StorageError(res.message ?? 'Unknown error', {
            cause: res,
          }),
        };
      }
      return {
        status: 'success',
        key: res.id ?? 'unknown',
      };
    });
  }

  [Symbol.dispose](): void {
    for (const teardown of this.#teardown) {
      teardown();
    }
  }
}

export default PouchDbStorage;
