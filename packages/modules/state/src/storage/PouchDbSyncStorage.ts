import PouchDB from 'pouchdb';

import { StateSyncEvent, type StateEventType } from '../events/index.js';
import type { StateSyncPollTrigger } from '../events/StateSyncPollEvent.js';
import { observePouchDbSync } from './observe-pouch-db-sync.js';
import { observePouchDbReplicate } from './observe-pouch-db-replicate.js';
import { PouchDbStorage, type PouchDbStorageOptions } from './PouchDbStorage.js';
import type { AllowedValue } from '../types.js';

/** Default `pull.intervalMs` for `PouchDbSyncPullOptions` when `mode` isn't `'live'`. */
const DEFAULT_PULL_INTERVAL_MS = 60_000;

// Named constants for `PouchDbSyncPullOptions.mode` - kept as plain string values (not a TS
// `enum`) so the public type stays a string-literal union, still assignable from a raw string.
const PullMode = {
  Live: 'live',
  Interval: 'interval',
  VisibleInterval: 'visible-interval',
} as const;

/**
 * Controls how the remote-to-local (pull) direction of a {@link PouchDbSyncStorage} is
 * scheduled. Push always stays a continuous, live replication so local writes are never
 * held back - only pull scheduling is configurable, since it's the direction that keeps a
 * connection open per idle user regardless of whether they're editing anything.
 *
 * @property mode - `'live'` (default) mirrors prior behavior: a single continuous bidirectional
 * `db.sync()` connection. `'interval'` keeps push live but replaces the continuous pull
 * connection with a one-shot pull run on a timer, whether or not the tab is visible.
 * `'visible-interval'` is the same, except the timer tick is skipped entirely while the tab
 * is hidden - a backgrounded tab has no user waiting on fresh data, so there's no reason to
 * hold a connection open for it. Either non-`'live'` mode trades real-time cross-tab/device
 * pull for far fewer concurrently open connections at scale.
 * @property intervalMs - Milliseconds between one-shot pulls when `mode` isn't `'live'`.
 * Defaults to 60000 (one minute).
 * @property refreshOnFocus - Also runs a one-shot pull immediately when the tab regains
 * visibility, when `mode` isn't `'live'`. Defaults to `true`.
 */
export type PouchDbSyncPullOptions = {
  mode?: (typeof PullMode)[keyof typeof PullMode];
  intervalMs?: number;
  refreshOnFocus?: boolean;
};

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
  /** Pull-replication scheduling. Omit to keep the default `'live'` behavior. */
  pull?: PouchDbSyncPullOptions;
};

/** PouchDB storage adapter that synchronizes a local database with a remote database. */
export class PouchDbSyncStorage extends PouchDbStorage {
  #remoteDb: PouchDB.Database;
  #syncOptions: PouchDB.Replication.SyncOptions;
  #pull: PouchDbSyncPullOptions;
  // With a continuous (`live: true`) sync started once from `_initialize()`, this only guards
  // a caller who calls the public `sync()` a second time while one is still active.
  #activeSync: PouchDB.Replication.Sync<{ value: AllowedValue }> | undefined;
  // Guards `_schedulePulling()` the same way `#activeSync` guards `sync()` - a running
  // one-shot pull must finish before the next interval/focus trigger starts another.
  #pullInFlight = false;

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
    this.#pull = options.pull ?? {};
  }

  /** Initializes local storage and starts synchronization. */
  protected _initialize(): void {
    super._initialize();
    // Either non-'live' mode trades the continuous pull connection for live push + scheduled
    // one-shot pulls - they only differ in whether `_schedulePulling` skips hidden-tab ticks.
    if ((this.#pull.mode ?? PullMode.Live) === PullMode.Live) {
      this.sync();
    } else {
      this._startLivePush();
      this._schedulePulling();
    }
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

  /**
   * Starts a continuous, live push replication (local to remote only). Used instead of
   * `sync()` when `pull.mode` is `'interval'`, so local writes still replicate out immediately
   * without keeping a matching continuous pull connection open.
   * @template T - State value type.
   * @returns The live push replication handle.
   */
  protected _startLivePush<
    T extends AllowedValue = AllowedValue,
  >(): PouchDB.Replication.Replication<{
    value: T;
  }> {
    const push = this._db.replicate.to<{ value: T }>(
      this.#remoteDb as PouchDB.Database<{ value: T }>,
      {
        ...this.#syncOptions,
        live: true,
        retry: this.#syncOptions.retry ?? true,
      },
    );

    const subscription = observePouchDbReplicate<T>(push, 'push', (doc) => ({
      _id: doc._id,
      key: this._extractKey(doc._id),
      value: doc.value,
    })).subscribe({ next: (event) => this._emitEvent(event as StateEventType) });

    this._addTeardown(() => push.cancel());
    this._addTeardown(subscription);

    return push;
  }

  /**
   * Runs a single one-shot pull replication (remote to local only) and resolves once it
   * completes. Skips starting a new pull while one is already in flight, mirroring how
   * `sync()` avoids overlapping bidirectional syncs. Either way, dispatches `onStateSync.poll`
   * so a monitor can observe that scheduled polling is actually running.
   * @template T - State value type.
   * @param trigger - What caused this poll: the initial pull, the interval timer, or tab/window focus.
   * @returns Resolves once the pull replication completes, or immediately if one was already running.
   */
  protected _pullOnce<T extends AllowedValue = AllowedValue>(
    trigger: StateSyncPollTrigger = 'interval',
  ): Promise<void> {
    // A running pull already covers whatever a second trigger (timer firing mid-pull,
    // or focus regained during a scheduled pull) would ask for - skip instead of overlapping.
    if (this.#pullInFlight) {
      this._emitEvent(
        new StateSyncEvent.Poll({ detail: { trigger, skipped: true } }) as StateEventType,
      );
      return Promise.resolve();
    }
    this.#pullInFlight = true;
    this._emitEvent(
      new StateSyncEvent.Poll({ detail: { trigger, skipped: false } }) as StateEventType,
    );

    let pull: PouchDB.Replication.Replication<{ value: T }>;
    try {
      pull = this._db.replicate.from<{ value: T }>(
        this.#remoteDb as PouchDB.Database<{ value: T }>,
        {
          ...this.#syncOptions,
          live: false,
          retry: false,
          // Guarantees 'complete'/'error' fires even against a backend that never answers a
          // one-shot request - otherwise a single hung poll would wedge #pullInFlight forever,
          // silently turning every later timer/focus trigger into a no-op skip.
          timeout: this.#syncOptions.timeout ?? 30000,
        },
      );
    } catch (error) {
      console.error('[state] failed to start one-shot pull replication', error);
      // A synchronous throw here (bad remote config, custom fetch misuse, etc.) would
      // otherwise never reach the 'error' handler below, wedging #pullInFlight forever -
      // every later trigger would then silently report `skipped: true` with no network call.
      this.#pullInFlight = false;
      this._emitEvent(
        new StateSyncEvent.Error({ detail: { type: 'error', error } }) as StateEventType,
      );
      return Promise.reject(error);
    }

    const subscription = observePouchDbReplicate<T>(pull, 'pull', (doc) => ({
      _id: doc._id,
      key: this._extractKey(doc._id),
      value: doc.value,
    })).subscribe({ next: (event) => this._emitEvent(event as StateEventType) });

    // Registered so disposing storage while this pull is mid-flight cancels its request,
    // listeners, and watchdog instead of leaving them running past the storage's own lifetime.
    // Deregistered in `finish()` below - `_pullOnce` runs repeatedly for the life of the
    // storage, so leaving these registered past each pull's own completion would leak one
    // teardown entry per poll.
    const removePullTeardown = this._addTeardown(() => pull.cancel());
    const removeSubscriptionTeardown = this._addTeardown(subscription);

    return new Promise((resolve) => {
      let settled = false;
      const finish = (error?: unknown) => {
        // 'complete'/'error' can both fire in some PouchDB versions, and the watchdog/promise
        // fallbacks below can race with either - only unblock once, whichever gets here first.
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        subscription.unsubscribe();
        removePullTeardown();
        removeSubscriptionTeardown();
        this.#pullInFlight = false;
        // Only the rejection branch passes an error - 'complete'/'error' already emitted
        // their own onStateSync.error via observePouchDbReplicate, and the watchdog's forced
        // cancel isn't itself an error worth surfacing again.
        if (error !== undefined) {
          this._emitEvent(
            new StateSyncEvent.Error({ detail: { type: 'error', error } }) as StateEventType,
          );
        }
        resolve();
      };
      pull.on('complete', () => finish());
      pull.on('error', () => finish());

      // `Replication` is also thenable (it resolves/rejects the same way `db.sync()`'s
      // `.then()` does) - a fallback for when the 'complete'/'error' *events* themselves
      // don't fire, which has been observed to happen even though the underlying requests succeed.
      // A rejection reaching here (rather than the 'error' event above) would otherwise surface
      // as a silent no-op - report it as an onStateSync.error instead of discarding the reason.
      pull.then(
        () => finish(),
        (error) => finish(error),
      );

      // PouchDB's own `timeout` option only bounds the underlying `_changes` request, not the
      // full replication (checkpoint read/write, `_revs_diff`, `_bulk_get`) - observed in practice
      // to never emit 'complete'/'error' at all in some cases, wedging #pullInFlight forever.
      // This watchdog guarantees forward progress regardless of where PouchDB got stuck.
      const watchdogMs =
        (typeof this.#syncOptions.timeout === 'number' ? this.#syncOptions.timeout : 30000) + 5000;
      const watchdog = setTimeout(() => {
        pull.cancel();
        finish();
      }, watchdogMs);
    });
  }

  /**
   * Schedules recurring one-shot pulls in place of a continuous pull connection: an immediate
   * pull, then one every `pull.intervalMs` (default 60s) - skipping the tick while the tab is
   * hidden when `mode` is `'visible-interval'` - plus an extra catch-up pull whenever it becomes
   * visible again, when `pull.refreshOnFocus` isn't disabled. Cleaned up automatically on dispose.
   */
  protected _schedulePulling(): void {
    const intervalMs = this.#pull.intervalMs ?? DEFAULT_PULL_INTERVAL_MS;
    const pauseWhenHidden = this.#pull.mode === PullMode.VisibleInterval;
    const run = (trigger: StateSyncPollTrigger) => {
      this._pullOnce(trigger).catch(() => {
        // Errors already surface as `onStateSync.error` events via `_pullOnce`'s subscription.
      });
    };

    run('initial');
    const timer = setInterval(() => {
      // A backgrounded tab has no user waiting on fresh data - skip the tick rather than
      // hold a connection open for it, and let the visibilitychange catch-up handle it instead.
      if (
        !pauseWhenHidden ||
        typeof document === 'undefined' ||
        document.visibilityState === 'visible'
      ) {
        run('interval');
      }
    }, intervalMs);
    this._addTeardown(() => clearInterval(timer));

    // Skip entirely outside a DOM environment (e.g. SSR) where there's no tab to focus.
    if ((this.#pull.refreshOnFocus ?? true) && typeof document !== 'undefined') {
      // Catch up immediately when the user comes back to the tab, instead of waiting for the timer.
      // Deliberately the Page Visibility API only, not `window`'s `focus`/`blur` - apps here run
      // embedded in the portal's iframe, where focus/blur fire on frame-boundary changes (e.g.
      // clicking portal chrome) unrelated to the tab actually being left and returned to.
      const onVisibilityChange = () => {
        // Ignore the tab being hidden - only a return to visible warrants an extra pull.
        if (document.visibilityState === 'visible') {
          run('focus');
        }
      };
      document.addEventListener('visibilitychange', onVisibilityChange);
      this._addTeardown(() => document.removeEventListener('visibilitychange', onVisibilityChange));
    }
  }
}
