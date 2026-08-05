import PouchDB from 'pouchdb';

import type { StateEventType } from '../events/index.js';
import { observePouchDbSync } from './observe-pouch-db-sync.js';
import { PouchDbStorage, type PouchDbStorageOptions } from './PouchDbStorage.js';
import type { AllowedValue } from '../types.js';

type PouchDbSyncStorageOptions = {
  localDb: {
    name_or_instance: string | PouchDB.Database;
    options?: PouchDbStorageOptions;
  };
  remoteDb: {
    name_or_instance: string | PouchDB.Database;
    options?: PouchDbStorageOptions;
  };
  syncOptions: PouchDB.Replication.SyncOptions;
};

/** PouchDB storage adapter that synchronizes a local database with a remote database. */
export class PouchDbSyncStorage extends PouchDbStorage {
  #remoteDb: PouchDB.Database;
  #syncOptions: PouchDB.Replication.SyncOptions;
  // With a continuous (`live: true`) sync started once from `_initialize()`, this only guards
  // a caller who calls the public `sync()` a second time while one is still active.
  #activeSync: PouchDB.Replication.Sync<{ value: AllowedValue }> | undefined;

  /**
   * Creates a synchronized storage adapter.
   * @param options - Local, remote, and replication configuration.
   */
  constructor(options: PouchDbSyncStorageOptions) {
    super(options.localDb.name_or_instance, options.localDb.options);
    this.#remoteDb =
      typeof options.remoteDb.name_or_instance === 'string'
        ? new PouchDB(options.remoteDb.name_or_instance, options.remoteDb.options)
        : options.remoteDb.name_or_instance;
    this.#syncOptions = options.syncOptions;
  }

  /** Initializes local storage and starts synchronization. */
  protected _initialize(): void {
    super._initialize();
    this.sync();
  }

  /**
   * Starts synchronization with the configured remote database.
   * @template T - State value type.
   * @param options - Optional replication overrides.
   * @returns The active PouchDB synchronization handle.
   */
  public sync<T extends AllowedValue = AllowedValue>(
    options?: PouchDB.Replication.SyncOptions,
  ): PouchDB.Replication.Sync<{ value: T }> {
    return this._sync<T>(
      this.#remoteDb as PouchDB.Database<{ value: T }>,
      options ?? this.#syncOptions,
    );
  }

  /**
   * Creates and observes a PouchDB bidirectional replication stream.
   * @template T - State value type.
   * @param target - Remote database to synchronize with.
   * @param options - Optional replication settings.
   * @returns The active PouchDB synchronization handle.
   */
  protected _sync<T extends AllowedValue = AllowedValue>(
    target: PouchDB.Database<{ value: T }>,
    options?: PouchDB.Replication.SyncOptions,
  ): PouchDB.Replication.Sync<{ value: T }> {
    // A second call while one is already active would otherwise fight over the same
    // checkpoint doc - just hand back the existing handle instead of starting another.
    if (this.#activeSync) {
      // safe: `#activeSync` is only ever assigned a `Sync<{ value: AllowedValue }>` cast
      // from this same generic method, so `T` always matches what's actually stored.
      return this.#activeSync as unknown as PouchDB.Replication.Sync<{ value: T }>;
    }

    // Layer defaults under caller options so any other `SyncOptions` field (filter, since,
    // batches_limit, etc.) still reaches PouchDB unmodified.
    const {
      live = true, // Keep sync active indefinitely
      retry = true, // Automatically retry on failures
      heartbeat = 10000, // Send heartbeat to detect connection issues
      timeout = 30000, // Connection timeout
      ...rest
    } = options ?? {};

    // Create bidirectional sync with target database
    const sync = this._db.sync<{ value: T }>(target, {
      ...rest,
      live,
      retry,
      heartbeat,
      timeout,
    });
    this.#activeSync = sync as PouchDB.Replication.Sync<{ value: AllowedValue }>;

    // Register cleanup function to prevent memory leaks
    this._addTeardown(() => sync.cancel());

    // Create observable to monitor sync events and convert to our event format
    const syncEvent$ = observePouchDbSync<T>(sync, (doc) => ({
      _id: doc._id,
      key: this._extractKey(doc._id), // Extract user key from prefixed document ID
      value: doc.value,
    }));

    // Subscribe to sync events and forward them to main event stream
    const subscription = syncEvent$.subscribe({
      next: (event) => this._emitEvent(event as StateEventType),
    });

    // Clean up sync subscription when sync completes
    sync.on('complete', () => {
      subscription.unsubscribe();
      // only clear the handle if it's still this sync - a newer one may have replaced it
      if (this.#activeSync === sync) {
        this.#activeSync = undefined;
      }
    });

    // Register cleanup function to prevent memory leaks
    this._addTeardown(subscription);

    return sync;
  }
}
