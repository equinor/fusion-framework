import { StateProvider } from '@equinor/fusion-framework-module-state';
import { PouchDbStorage } from '@equinor/fusion-framework-module-state/storage';
import type { StateWithReplicaConfig } from './configurator';
import type { SyncEvent } from './types';
import { ReplaySubject } from 'rxjs';
import { ObserveSync } from './observe-sync';

export class StateWithReplicaProvider extends StateProvider {
  #localDb: PouchDB.Database;
  #remoteDb: PouchDB.Database;
  #sync: ReplaySubject<SyncEvent>;

  get syncEvent$() {
    return this.#sync.asObservable();
  }

  constructor(config: StateWithReplicaConfig) {
    super({
      storage: new PouchDbStorage(config.localDb),
    });
    this.#sync = new ReplaySubject<SyncEvent>();
    this.#localDb = config.localDb;
    this.#remoteDb = config.remoteDb;
  }

  async initialize(): Promise<void> {
    await super.initialize();
    try {
      const sync = this.#localDb.sync(this.#remoteDb, {
        live: true, // Enable live replication
        retry: true, // Automatically retry on connection failures
        heartbeat: 10000, // Send heartbeat every 10 seconds
        timeout: 30000, // Connection timeout (30 seconds)
      });
      this._addTeardown(ObserveSync(sync).subscribe(this.#sync));
    } catch (error) {
      console.error('Failed to start sync:', error);
      this.#sync.next({
        type: 'error',
        error,
        id: 'failed-sync',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
