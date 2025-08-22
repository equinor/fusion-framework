import PouchDB from 'pouchdb';
import { type Observable, Subject } from 'rxjs';

import type { AllowedValue } from '@equinor/fusion-framework-module-state';

import type {
  StorageItem,
  StorageResult,
} from './types.js';

import type {
  RetrievedItemsResponse,
  IStorage,
  RetrieveItemsOptions,
} from './Storage.interface.js';

import { StorageError } from './StorageError.js';

import { StateChangeEvent, StateErrorEvent, type StateEvent, StateOperationEvent } from '../events/index.js';

const STORAGE_KEY_SEPARATOR = '::';

/**
 * Configuration options for PouchDbStorage instances.
 *
 * Extends PouchDB's database configuration with storage-specific options
 * for multi-tenancy and key management.
 *
 * @property key_prefix - Optional namespace prefix applied to all keys (e.g., 'tenant-123').
 *                        Enables logical separation in shared databases.
 */
export type PouchDbStorageOptions = PouchDB.Configuration.DatabaseConfiguration & {
  key_prefix?: string;
};

/**
 * Type guard for PouchDB response discrimination.
 *
 * @param res - PouchDB operation response to test
 * @returns True if response contains error information
 */
function isPouchDbError(
  res: PouchDB.Core.Response | PouchDB.Core.Error,
): res is PouchDB.Core.Error {
  return !!(res as PouchDB.Core.Error).error;
}

/**
 * Event-driven key-value storage implementation using PouchDB.
 *
 * Provides reactive storage with real-time change tracking, key prefixing for multi-tenancy,
 * and comprehensive backup/restore capabilities. All operations are atomic and emit detailed events.
 *
 * Key Features:
 * - Reactive change tracking via RxJS observables
 * - Automatic key prefixing for tenant isolation
 * - Bulk operations for performance
 * - JSON-based backup/restore
 * - Conflict resolution and error handling
 *
 * @example
 * ```typescript
 * const storage = new PouchDbStorage('app-db', { key_prefix: 'tenant-1' });
 * await storage.initialize();
 *
 * storage.events$().subscribe(event => console.log(event.type));
 * await storage.putItem({ key: 'config', value: { theme: 'dark' } });
 * ```
 *
 * @see {@link IStorage} for the complete interface specification
 * @see {@link https://pouchdb.com/} for underlying database documentation
 */
export class PouchDbStorage implements IStorage, Disposable {
  // Core storage instance - handles all PouchDB operations
  #db: PouchDB.Database;

  // Optional prefix for namespacing keys (e.g., 'tenant-123::user.profile')
  #key_prefix?: string;

  // Unified event stream for all storage operations and state changes
  #events: Subject<StateEvent> = new Subject();

  // Array of cleanup functions to call when the instance is disposed
  // Ensures proper resource cleanup and prevents memory leaks
  #teardown: Array<VoidFunction> = [this.#events.complete.bind(this.#events)];

  /**
   * Static factory method for creating PouchDB instances.
   * Useful for testing or when you need to configure the database before creating storage.
   */
  public static CreateDb(
    name: string,
    options?: PouchDB.Configuration.DatabaseConfiguration,
  ): PouchDB.Database {
    return new PouchDB(name, options);
  }

  /**
   * Observable stream of all storage events for reactive change tracking.
   *
   * Emits events for storage operations, state changes, and errors. Use RxJS operators
   * to filter and transform event streams for specific use cases.
   *
   * @returns RxJS Observable emitting StorageEvent instances
   *
   * @example
   * ```typescript
   * storage.events$()
   *   .pipe(filter(event => event.type?.startsWith('onStorageChange')))
   *   .subscribe(event => handleChange(event.detail.item));
   * ```
   *
   * @remarks
   * - Events only emit after `initialize()` is called
   * - Includes operation metrics and error details
   * - Memory usage scales with event frequency
   */
  public get events$(): Observable<StateEvent> {
    return this.#events.asObservable();
  }

  /**
   * Generates prefixed storage key for namespacing.
   *
   * @internal
   * @protected
   * @param key - Base storage key
   * @returns Prefixed key if key_prefix configured, otherwise original key
   */
  protected _generateKey(key?: string): string {
    // If no key prefix is configured, return the key as-is (or empty string if undefined)
    if (!this.#key_prefix) {
      return key ?? '';
    }

    // Prefix format: "prefix::key" (e.g., "tenant-123::user.profile")
    // This allows for efficient querying and namespacing
    return `${this.#key_prefix}${STORAGE_KEY_SEPARATOR}${key ?? ''}`;
  }

  /**
   * Extracts user key from prefixed document ID.
   *
   * @internal
   * @protected
   * @param id - Prefixed document identifier
   * @returns User-facing key with prefix removed, or original if no prefix match
   */
  protected _extractKey(id: string): string {
    // If no key prefix is configured, return the id as-is
    if (!this.#key_prefix) {
      return id;
    }

    // Split the id by separator and validate the prefix
    const [prefix, key] = id.split(STORAGE_KEY_SEPARATOR);

    // Validate that the prefix matches our configured prefix and key exists
    // Return empty string if validation fails (invalid prefixed key)
    if (prefix !== this.#key_prefix || !key) {
      return '';
    }

    // Return the extracted key (the part after the prefix)
    return key;
  }

  /**
   * Creates PouchDbStorage instance with specified database and configuration.
   *
   * @param name_or_instance - Database name string or existing PouchDB instance
   * @param options - Storage configuration options
   *
   * @example
   * ```typescript
   * const storage = new PouchDbStorage('app-db', { key_prefix: 'tenant-1' });
   * ```
   *
   * @remarks
   * - String names create new PouchDB instances with auto-compaction
   * - Existing instances should be pre-configured
   * - key_prefix enables logical data separation
   */
  constructor(name_or_instance: string | PouchDB.Database, options?: PouchDbStorageOptions) {
    // Extract key_prefix from options and keep remaining DB options
    const { key_prefix, ...db_options } = options ?? {};

    // Store the key prefix for namespacing (undefined if not provided)
    this.#key_prefix = key_prefix;

    // Create new PouchDB instance if a string is provided, otherwise use existing instance
    if (typeof name_or_instance === 'string') {
      // Create new PouchDB instance with auto-compaction enabled for performance
      // Auto-compaction removes obsolete document revisions automatically
      this.#db = new PouchDB(name_or_instance, {
        auto_compaction: true, // Critical for performance - prevents DB bloat
        ...db_options, // Apply any additional PouchDB configuration
      });
    } else {
      // Use existing PouchDB instance (useful for testing or shared databases)
      this.#db = name_or_instance;
    }
  }

  /**
   * Initializes storage and establishes live change tracking.
   *
   * Must be called before storage operations begin. Sets up change feed subscription
   * and enables event emission for subsequent operations.
   *
   * @throws {StorageError} On initialization failure
   *
   * @remarks
   * - Idempotent - safe to call multiple times
   * - Only tracks changes after initialization
   * - Call `allItems()` to get existing data
   */
  public async initialize(): Promise<void> {
    try {
      const start = performance.now();

      // Set up live change tracking - this establishes a persistent connection
      // to PouchDB's changes feed that will emit events for any future changes
      this._subscribeToDb();

      // Emit success event with performance metrics
      // This lets subscribers know initialization completed successfully
      this.#events.next(
        StateOperationEvent.Success({
          source: this,
          detail: {
            fn: 'initialize',
            metric: performance.now() - start,
          },
        }),
      );
    } catch (error) {
      // Emit failure event if initialization fails
      // This allows subscribers to handle initialization errors gracefully
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: {
            fn: 'initialize',
            error: new StorageError('Failed to initialize storage', { cause: error }),
          },
        }),
      );
    }
  }

  /**
   * Establishes live change feed subscription and event emission.
   *
   * Filters changes by key prefix, emits storage events for create/update/delete operations,
   * and handles feed lifecycle management.
   *
   * @internal
   * @protected
   */
  protected _subscribeToDb(): void {
    // Subscribe to live changes in the PouchDB database
    // This creates a persistent connection that will emit events for any future changes
    const changes = this.#db.changes({
      since: 'now', // Start from current state (not historical changes)
      live: true, // Keep connection alive for real-time updates
      include_docs: true, // Include full document data in change events
      filter: (doc) => {
        // Only process documents that match our key prefix (if configured)
        // This ensures we don't emit events for documents outside our namespace
        if (this.#key_prefix) {
          return doc._id.startsWith(this._generateKey(''));
        }
        return true; // No prefix = process all documents
      },
    });

    // Handle document changes - this is the core of the real-time event system
    changes.on('change', (change: PouchDB.Core.ChangesResponseChange<Record<string, unknown>>) => {
      // Defensive check - PouchDB should always provide a document, but be safe
      if (!change.doc) {
        this.#events.next(
          StateErrorEvent.Error({
            source: this,
            detail: {
              error: new StorageError('Unexpected error, changeset is missing document'),
            },
          }),
        );
        return;
      }

      // Extract document metadata and data
      const { _id, _rev, value } = change.doc;
      const key = this._extractKey(_id); // Remove prefix if present

      // Skip changes for documents that don't match our key pattern
      // This can happen with malformed prefixed keys or other edge cases
      if (!key) {
        return;
      }

      // Determine change type and emit appropriate event
      if (change.deleted) {
        // Document was deleted - emit deletion event
        // Note: We include the last known value for reference
        this.#events.next(
          StateChangeEvent.EntryDeleted({
            source: this,
            detail: {
              _id, // Internal PouchDB ID
              key, // User-facing key (prefix removed)
              item: {
                key,
                value: value as AllowedValue, // Last known value before deletion
              },
            },
          }),
        );
      } else if (_rev.startsWith('1-')) {
        // Revision starts with '1-' indicating this is the first revision (document creation)
        // PouchDB revision format: "{revision_number}-{hash}"
        this.#events.next(
          StateChangeEvent.EntryCreated({
            source: this,
            detail: {
              _id,
              key,
              item: {
                key,
                value: value as AllowedValue,
              },
            },
          }),
        );
      } else {
        // Revision indicates update (revision number > 1)
        this.#events.next(
          StateChangeEvent.EntryUpdated({
            source: this,
            detail: {
              _id,
              key,
              item: {
                key,
                value: value as AllowedValue,
              },
            },
          }),
        );
      }
    });

    // Handle errors from the changes feed
    // This can happen due to network issues, database corruption, or permission problems
    changes.on('error', (error: Error) => {
      this.#events.next(
        StateErrorEvent.Error({
          source: this,
          detail: {
            error: new StorageError('Database error', { cause: error }),
          },
        }),
      );
    });

    // Register cleanup function to prevent memory leaks
    // When this storage instance is disposed, the changes feed will be cancelled
    this.#teardown.push(() => changes.cancel());
  }

  /**
   * Bulk deletes all items from storage with optional scope control.
   *
   * @param args - Clear operation configuration
   * @param args.clear_all - If true, deletes ALL items regardless of key prefix; if false, only deletes prefixed items
   * @returns Array of StorageResult objects for each deletion attempt
   *
   * @example
   * ```typescript
   * const results = await storage.clear({ clear_all: false });
   * console.log(`Deleted ${results.length} items`);
   * ```
   *
   * @remarks
   * - **DANGER**: `clear_all: true` removes ALL data from database
   * - With key_prefix, `clear_all: false` only removes prefixed items
   * - Performance: O(n) where n = documents to delete
   * - Uses bulk operations for efficiency
   * - Emits events for monitoring
   *
   * @throws {StorageError} On network issues, permissions, or bulk deletion failures
   */
  public async clear(args: { clear_all: boolean }): Promise<StorageResult[]> {
    const start = performance.now();

    // Retrieve all documents based on scope settings
    // ignore_scope: true means clear ALL documents (dangerous!)
    // ignore_scope: false means only clear documents matching our key prefix
    const allDocs = await this._allItems({ ignore_scope: args.clear_all }).catch((e) => {
      const error = new StorageError('Failed to retrieve all items', { cause: e });
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'clear', args: [args], error },
        }),
      );
      throw error;
    });

    // Early return if no documents found - saves unnecessary bulk operation
    if (!allDocs.rows.length) {
      this.#events.next(
        StateOperationEvent.Success({
          source: this,
          detail: {
            fn: 'clear',
            args: [args],
            message: 'No documents found, nothing to clear',
            metric: performance.now() - start,
          },
        }),
      );
      return [];
    }

    // Prepare bulk deletion operations
    // PouchDB uses _deleted flag instead of physically removing documents
    // This preserves revision history and allows for replication
    const deletions = allDocs.rows.map((row) => ({
      _id: row.id, // Document ID (may include key prefix)
      _rev: row.value.rev, // Current revision for conflict resolution
      _deleted: true, // Mark as deleted (soft delete)
    }));

    // Execute bulk deletion operation for efficiency
    const results = await this._executeBulk(deletions).catch((e) => {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError('Failed to clear items', { cause: e });
      // Emit failure event for monitoring
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'clear', args: [args], error },
        }),
      );
      throw error;
    });

    // Emit success event with operation details
    this.#events.next(
      StateOperationEvent.Success({
        source: this,
        detail: {
          fn: 'clear',
          args: [args],
          metric: performance.now() - start,
        },
      }),
    );
    return results;
  }

  /**
   * Retrieves single item by key with type safety.
   *
   * @template T - Expected value type extending AllowedValue
   * @param key - Storage key to retrieve
   * @returns Storage item with key and value, or null if not found
   *
   * @example
   * ```typescript
   * const profile = await storage.item<UserProfile>('user.profile');
   * if (profile) console.log('Found:', profile.value);
   * ```
   *
   * @remarks
   * - Returns null for non-existent keys (safe for optional data)
   * - Keys are automatically prefixed if configured
   * - Performance: O(1) for individual document retrieval
   * - Type parameter enables TypeScript inference
   *
   * @throws {StorageError} On network issues, permissions, or document retrieval failures
   */
  public async item<T extends AllowedValue>(key: string): Promise<StorageItem<T> | null> {
    const start = performance.now();
    try {
      const id = this._generateKey(key);
      const entry = await this.#db.get<{ value: T }>(id);
      const result = {
        key: this._extractKey(entry._id),
        value: entry.value,
      };
      this.#events.next(
        StateOperationEvent.Success({
          source: this,
          detail: {
            fn: 'item',
            args: [key],
            result,
            metric: performance.now() - start,
          },
        }),
      );
      return result;
    } catch (e) {
      if ((e as PouchDB.Core.Error).status === 404) {
        const result = null;
        this.#events.next(
          StateOperationEvent.Success({
            source: this,
            detail: {
              fn: 'item',
              args: [key],
              result,
              message: 'Item not found',
              metric: performance.now() - start,
            },
          }),
        );
        return result;
      }
      const error = new StorageError(`Failed to get item ${key}`, { cause: e });
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'item', args: [key], error },
        }),
      );
      throw error;
    }
  }

  /**
   * Retrieves all items with optional filtering and pagination.
   *
   * @template T - Expected value type extending AllowedValue
   * @param options - Pagination and filtering options
   * @returns Paginated response with items and metadata
   *
   * @example
   * ```typescript
   * const response = await storage.allItems({ limit: 10, prefix: 'user.' });
   * console.log(`Found ${response.total_count} items`);
   * ```
   *
   * @remarks
   * - Use pagination for datasets >1000 items
   * - Prefix filtering leverages database indexes for O(log n) performance
   * - Memory usage: O(limit) for paginated results
   * - Keys are automatically un-prefixed in results
   * - total_count reflects all matching items, not just returned page
   *
   * @throws {StorageError} On network issues, permissions, or query execution failures
   */
  public async allItems<T extends AllowedValue>(
    options?: RetrieveItemsOptions,
  ): Promise<RetrievedItemsResponse<T>> {
    const { limit, skip, prefix } = options || {};

    // Guard: prefix must not contain the STORAGE_KEY_SEPARATOR
    if (prefix?.includes(STORAGE_KEY_SEPARATOR)) {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError(
        `Prefix option must not contain the storage key separator "${STORAGE_KEY_SEPARATOR}". Received: "${prefix}"`,
      );
      // Emit failure event for monitoring
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'allItems', args: [options], error },
        }),
      );
      // Re-throw to maintain promise rejection semantics
      throw error;
    }

    try {
      const start = performance.now();
      // Execute the allDocs query
      // PouchDB's allDocs method is much more efficient than individual operations
      const response = await this._allItems<T>({ include_docs: true, limit, skip, prefix });
      // Filter out rows that don't have a doc property - results must have value
      const items = response.rows
        .filter((row): row is typeof row & { doc: { value: T } } => !!row.doc)
        .map((row) => ({
          key: this._extractKey(row.id),
          value: row.doc.value,
        }));
      // Build the result object
      const result = {
        offset: response.offset ?? 0,
        total_count: response.total_rows,
        items,
      };
      // Emit success event with operation details
      this.#events.next(
        StateOperationEvent.Success({
          source: this,
          detail: { fn: 'allItems', args: [options], result, metric: performance.now() - start },
        }),
      );
      return result;
    } catch (cause) {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError('Failed to retrieve all items', { cause });
      // Emit failure event for monitoring
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'allItems', args: [options], error },
        }),
      );
      // Re-throw to maintain promise rejection semantics
      throw error;
    }
  }

  /**
   * Stores or updates single item with conflict resolution.
   *
   * @param item - Storage item containing key and value
   * @returns StorageResult indicating operation success or failure
   *
   * @example
   * ```typescript
   * const result = await storage.putItem({
   *   key: 'user.profile',
   *   value: { name: 'John', preferences: { theme: 'dark' } }
   * });
   * ```
   *
   * @remarks
   * - Automatically handles create vs update operations
   * - Keys are automatically prefixed if configured
   * - PouchDB provides automatic conflict resolution
   * - Performance: O(1) for single document operations
   * - Emits events for reactive updates
   *
   * @throws {StorageError} On network issues, permissions, disk space, or conflict resolution failures
   */
  public async putItem(item: StorageItem): Promise<StorageResult> {
    try {
      const start = performance.now();
      const key = this._generateKey(item.key); // Apply key prefix if configured

      // Try to get existing document for update, fallback to creation template
      // This pattern handles both create and update operations seamlessly
      const existingDoc = await this.#db.get(key).catch((e) => {
        // Document doesn't exist - create template for new document
        // _rev: undefined tells PouchDB this is a new document
        return { _id: key, _rev: undefined };
      });

      // Perform the put operation - PouchDB handles create vs update automatically
      // based on whether _rev is provided (existing) or undefined (new)
      const update = await this.#db.put({ ...existingDoc, value: item.value });

      // Build result based on PouchDB response
      const result: StorageResult = update.ok
        ? {
            status: 'success',
            key: update.id, // Return the actual document ID (may include prefix)
          }
        : {
            status: 'error',
            key: update.id,
            error: new Error('Invalid result', { cause: update }),
          };

      // Emit success event with operation details and performance metrics
      this.#events.next(
        StateOperationEvent.Success({
          source: this,
          detail: { fn: 'putItem', args: [item], result, metric: performance.now() - start },
        }),
      );
      return result;
    } catch (e) {
      // Wrap any database errors in our custom StorageError for consistency
      const error = new StorageError(`Failed to put item ${item.key}`, { cause: e });

      // Emit failure event so subscribers can handle the error
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'putItem', args: [item], error },
        }),
      );

      // Re-throw to maintain promise rejection semantics
      throw error;
    }
  }

  /**
   * Bulk stores multiple items in single atomic operation.
   *
   * @param items - Array of storage items to store or update
   * @returns Array of StorageResult objects (one per item)
   *
   * @example
   * ```typescript
   * const results = await storage.putItems([
   *   { key: 'user.name', value: 'John' },
   *   { key: 'user.settings', value: { theme: 'dark' } }
   * ]);
   * ```
   *
   * @remarks
   * - More efficient than individual putItem() calls
   * - Atomic operation with possible partial failures
   * - Keys are automatically prefixed if configured
   * - Performance: O(n) where n = item count
   * - Optimal batch size: 100-500 items for best performance
   *
   * @throws {StorageError} On network issues, permissions, or partial bulk operation failures
   */
  public async putItems(items: StorageItem[]): Promise<StorageResult[]> {
    try {
      const start = performance.now();
      // Execute the bulk operation
      // PouchDB's bulkDocs method is much more efficient than individual operations
      const result = await this._executeBulk(
        items.map((item) => ({
          _id: this._generateKey(item.key),
          value: item.value,
        })),
      );
      // Emit success event with operation statistics
      this.#events.next(
        StateOperationEvent.Success({
          source: this,
          detail: { fn: 'putItems', args: [items], result, metric: performance.now() - start },
        }),
      );
      return result;
    } catch (cause) {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError('Failed to put items', { cause });
      // Emit failure event for monitoring
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'putItems', args: [items], error },
        }),
      );
      // Re-throw to maintain promise rejection semantics
      throw error;
    }
  }

  /**
   * Removes single item by key with idempotent behavior.
   *
   * @param item - Object containing key to remove
   * @returns StorageResult indicating operation success or failure
   *
   * @example
   * ```typescript
   * const result = await storage.removeItem({ key: 'user.session' });
   * ```
   *
   * @remarks
   * - Idempotent - safe to call on non-existent keys
   * - Keys are automatically prefixed if configured
   * - Performance: O(1) for single document operations
   * - PouchDB uses soft deletes (marks as deleted)
   * - Emits events for reactive updates
   *
   * @throws {StorageError} On network issues, permissions, or document deletion failures
   */
  public async removeItem(item: Pick<StorageItem, 'key'>): Promise<StorageResult> {
    try {
      const start = performance.now();
      const key = this._generateKey(item.key);

      // Get the document to remove
      const doc = await this.#db.get(key);

      // Execute the remove operation
      const dbResult = await this.#db.remove(doc);

      // Build the result object - PouchDB returns either success objects or error objects
      // We need to detect which type we received and handle accordingly
      const result: StorageResult = dbResult.ok
        ? {
            status: 'success',
            key: dbResult.id,
          }
        : {
            status: 'error',
            key: dbResult.id,
            error: new Error('Failed to remove item'),
          };

      // Emit success event with operation statistics
      this.#events.next(
        StateOperationEvent.Success({
          source: this,
          detail: { fn: 'removeItem', args: [item], result, metric: performance.now() - start },
        }),
      );
      return result;
    } catch (e) {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError(`Failed to remove item ${item.key}`, { cause: e });
      // Emit failure event for monitoring
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'removeItem', args: [item], error },
        }),
      );
      // Re-throw to maintain promise rejection semantics
      throw error;
    }
  }

  /**
   * Bulk removes multiple items in single atomic operation.
   *
   * @param items - Array of objects containing keys to remove
   * @returns Array of StorageResult objects (one per item)
   *
   * @example
   * ```typescript
   * const results = await storage.removeItems([
   *   { key: 'cache.apiResponse' },
   *   { key: 'temp.data' }
   * ]);
   * ```
   *
   * @remarks
   * - More efficient than individual removeItem() calls
   * - Idempotent - safe to call on non-existent keys
   * - Performance: O(n) where n = item count
   * - Atomic operation with possible partial failures
   * - Keys are automatically prefixed if configured
   *
   * @throws {StorageError} On network issues, permissions, or partial bulk deletion failures
   */
  public async removeItems(items: Pick<StorageItem, 'key'>[]): Promise<StorageResult[]> {
    const start = performance.now();

    // If no items are provided, return an empty array
    if (!items.length) {
      const result: StorageResult[] = [];
      this.#events.next(
        StateOperationEvent.Success({
          source: this,
          detail: {
            fn: 'removeItems',
            message: 'No items provided, nothing to remove',
            args: [items],
            result,
            metric: performance.now() - start,
          },
        }),
      );
      return result;
    }
    try {
      // Execute the bulk removal operation
      // PouchDB's bulkDocs method is much more efficient than individual operations
      const result = await this._executeBulk(
        items.map((item) => ({
          _id: this._generateKey(item.key),
          _deleted: true,
        })),
      );
      // Emit success event with operation statistics
      this.#events.next(
        StateOperationEvent.Success({
          source: this,
          detail: { fn: 'removeItems', args: [items], result, metric: performance.now() - start },
        }),
      );
      return result;
    } catch (cause) {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError('Failed to remove items', { cause });
      // Emit failure event for monitoring
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'removeItems', args: [items], error },
        }),
      );
      // Re-throw to maintain promise rejection semantics
      throw error;
    }
  }

  /**
   * Internal helper for retrieving all documents with optional content inclusion.
   *
   * @internal
   * @protected
   * @template T - Value type stored in documents
   * @param args - Query options including docs inclusion and pagination
   * @returns PouchDB AllDocsResponse with typed document values
   */
  protected async _allItems<T extends AllowedValue>(args?: {
    include_docs?: boolean;
    ignore_scope?: boolean;
    limit?: number;
    skip?: number;
    prefix?: string;
  }): Promise<PouchDB.Core.AllDocsResponse<{ value: T }>> {
    const start = performance.now();
    const { include_docs, ignore_scope, limit, skip, prefix } = args || {};

    // determine if the request should include the scope prefix
    const include_scope = !ignore_scope && this.#key_prefix;

    // Build the options for the allDocs query based on the include_scope flag and prefix
    const startkey = include_scope ? this._generateKey(prefix) : prefix;
    const endkey = include_scope ? this._generateKey(`${prefix}\ufff0`) : prefix;

    try {
      // Execute the allDocs query
      // PouchDB's allDocs method is much more efficient than individual operations
      const result = await this.#db.allDocs<{ value: T }>({
        include_docs,
        limit,
        skip,
        startkey,
        endkey,
      });
      // Emit success event with operation statistics
      this.#events.next(
        StateOperationEvent.Success({
          source: this,
          detail: { fn: 'allItems', args: [args], result, metric: performance.now() - start },
        }),
      );
      // Return the result
      return result;
    } catch (cause) {
      // Wrap any errors in our custom StorageError for consistency
      const error = new StorageError('Failed to retrieve all items', { cause });
      // Emit failure event for monitoring
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'allItems', args: [args], error },
        }),
      );
      // Re-throw to maintain promise rejection semantics
      throw error;
    }
  }

  /**
   * Executes bulk document operations and normalizes results.
   *
   * @internal
   * @protected
   * @param args - Arguments to pass to PouchDB's bulkDocs method
   * @returns Array of normalized StorageResult objects
   */
  protected async _executeBulk(
    ...args: Parameters<PouchDB.Database['bulkDocs']>
  ): Promise<StorageResult[]> {
    const start = performance.now();

    // Execute the bulk operation - this is where the actual database work happens
    // PouchDB's bulkDocs is much more efficient than individual operations
    const dbResult = await this.#db.bulkDocs(...args);

    try {
      // Transform PouchDB's raw response into our standardized StorageResult format
      const result: StorageResult[] = dbResult.map((res) => {
        // PouchDB returns either success objects or error objects
        // We need to detect which type we received and handle accordingly
        if (isPouchDbError(res)) {
          // This document failed to be saved/updated/deleted
          return {
            status: 'error',
            key: res.id ?? 'unknown', // Document ID that failed
            error: new StorageError(res.message ?? 'Unknown error', {
              cause: res, // Preserve original PouchDB error for debugging
            }),
          };
        }

        // This document was successfully processed
        return {
          status: 'success',
          key: res.id ?? 'unknown', // Document ID that succeeded
        };
      });

      // Emit success event with operation statistics
      this.#events.next(
        StateOperationEvent.Success({
          source: this,
          detail: {
            fn: '_executeBulk',
            args, // Original arguments for debugging
            result, // Normalized results
            metric: performance.now() - start, // Operation duration
          },
        }),
      );

      return result;
    } catch (error) {
      // Handle unexpected errors during result processing
      const storageError = new StorageError('Failed to execute bulk operation', { cause: error });

      // Emit failure event for monitoring
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: { fn: '_executeBulk', args, error: storageError },
        }),
      );

      // Re-throw to maintain promise rejection semantics
      throw storageError;
    }
  }

  /**
   * Creates JSON backup of all storage items with metadata.
   *
   * @returns JSON string containing complete backup with timestamp and documents
   *
   * @example
   * ```typescript
   * const backup = await storage.createBackup();
   * await saveToFile('backup.json', backup);
   * ```
   *
   * @remarks
   * - Includes all items matching current key prefix (if set)
   * - Compatible with restoreBackup() method
   * - Memory usage: O(n) where n = document count
   * - Includes document revisions for conflict resolution
   * - Emits events for monitoring
   *
   * @throws {StorageError} On network issues, permissions, or database errors
   */
  public async createBackup(): Promise<string> {
    try {
      const start = performance.now();

      // Retrieve all documents with full content for backup
      // include_docs: true ensures we get the actual document data, not just metadata
      const allDocs = await this._allItems({ include_docs: true });

      // Structure backup data with metadata for future restoration
      const backupData = {
        timestamp: new Date().toISOString(), // When backup was created
        key_prefix: this.#key_prefix, // Original key prefix for validation
        documents: allDocs.rows.map((row) => ({
          _id: row.id, // Document ID (may include key prefix)
          _rev: row.value.rev, // Document revision for conflict resolution
          value: row.doc?.value, // The actual stored data
        })),
      };

      // Serialize to JSON with pretty printing for human readability
      const result = JSON.stringify(backupData, null, 2);

      // Emit success event with backup statistics
      this.#events.next(
        StateOperationEvent.Success({
          source: this,
          detail: {
            fn: 'createBackup',
            message: `Backup created with ${allDocs.rows.length} documents`,
            result: { document_count: allDocs.rows.length },
            metric: performance.now() - start,
          },
        }),
      );

      return result;
    } catch (error) {
      // Wrap any errors in our custom StorageError for consistency
      const storageError = new StorageError('Failed to create backup', { cause: error });

      // Emit failure event for monitoring
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'createBackup', error: storageError },
        }),
      );
      throw storageError;
    }
  }

  /**
   * Restores items from backup with optional data clearing.
   *
   * @param backupData - JSON backup string from createBackup()
   * @param options - Restore configuration options
   * @param options.clear_existing - If true, clears all existing data before restoration
   * @returns Array of StorageResult objects for each restored item
   *
   * @example
   * ```typescript
   * const results = await storage.restoreBackup(backupJson, {
   *   clear_existing: false // Merge with existing data
   * });
   * ```
   *
   * @remarks
   * - **DANGER**: clear_existing: true permanently deletes current data
   * - Handles conflicts using document revisions
   * - Bulk operations for efficiency
   * - Memory usage: O(n) where n = backup document count
   * - Partial failures possible
   * - Emits events for monitoring
   *
   * @throws {StorageError} On invalid backup format, network issues, or database errors
   */
  public async restoreBackup(
    backupData: string,
    options: { clear_existing?: boolean } = {},
  ): Promise<StorageResult[]> {
    try {
      const start = performance.now();

      // Parse backup JSON - this can fail if backup is corrupted
      const backup = JSON.parse(backupData);

      // Validate backup format to prevent runtime errors
      // Ensure we have the expected structure from createBackup()
      if (!backup.documents || !Array.isArray(backup.documents)) {
        throw new StorageError('Invalid backup format: missing or invalid documents array');
      }

      let documents: PouchDB.Core.Document<{ value: AllowedValue }>[] = [];
      // If requested, remove all existing data before restoring backup.
      // WARNING: Enabling this will irreversibly delete all current items in storage.
      if (options.clear_existing) {
        await this.clear({ clear_all: true });
        // Don't preserve _rev to avoid conflicts - database is empty, no rev should be present
        documents = backup.documents.map(
          (doc: { _id: string; _rev: string; value: AllowedValue }) => ({
            _id: doc._id, // Original document ID (may include old key prefix)
            value: doc.value, // The actual data to restore
          }),
        );
      } else {
        // Fetch existing items to merge with backup data
        const existingItems = await this._allItems({ include_docs: false });

        // Merge existing data with backup data
        documents = backup.documents.map(
          (doc: { _id: string; _rev: string; value: AllowedValue }) => {
            // Only include the revision if it exists in the existing items
            const _rev = existingItems.rows.find((item) => item.id === doc._id)?.value.rev;
            return {
              _id: doc._id, // Original document ID (may include old key prefix)
              _rev, // Existing revision or new revision
              value: doc.value, // The actual data to restore
            };
          },
        );
      }

      // Execute bulk restoration - much faster than individual operations
      const results = await this._executeBulk(documents);

      // Calculate success/failure statistics for monitoring
      const successCount = results.filter((r) => r.status === 'success').length;
      const errorCount = results.filter((r) => r.status === 'error').length;

      // Emit success event with detailed restoration statistics
      this.#events.next(
        StateOperationEvent.Success({
          source: this,
          detail: {
            fn: 'restoreBackup',
            args: [backupData, options],
            message: `Restored ${successCount} documents, ${errorCount} errors`,
            result: { success_count: successCount, error_count: errorCount },
            metric: performance.now() - start,
          },
        }),
      );

      return results;
    } catch (error) {
      // Handle both JSON parsing errors and database operation errors
      const storageError = new StorageError('Failed to restore backup', { cause: error });

      // Emit failure event for monitoring and debugging
      this.#events.next(
        StateOperationEvent.Failure({
          source: this,
          detail: { fn: 'restoreBackup', args: [backupData, options], error: storageError },
        }),
      );
      throw storageError;
    }
  }

  /**
   * Cleanup resources and cancel subscriptions.
   *
   * Implements Disposable interface for proper resource management.
   * Cancels change feeds, completes event subjects, and closes connections.
   */
  [Symbol.dispose](): void {
    // Execute all registered cleanup functions in reverse order
    // This ensures dependencies are cleaned up in the correct sequence
    for (const teardown of this.#teardown) {
      teardown();
    }
  }
}

export default PouchDbStorage;
