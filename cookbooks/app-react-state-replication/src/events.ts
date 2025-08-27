import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import type { SyncEvent } from './modules/app-state-with-replication/types';

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    onCouchdbSyncChange: FrameworkEvent<
      FrameworkEventInit<SyncEvent, { localDb: PouchDB.Database; remoteDb: PouchDB.Database }>
    >;
    onCouchdbSyncPaused: FrameworkEvent<
      FrameworkEventInit<SyncEvent, { localDb: PouchDB.Database; remoteDb: PouchDB.Database }>
    >;
    onCouchdbSyncActive: FrameworkEvent<
      FrameworkEventInit<SyncEvent, { localDb: PouchDB.Database; remoteDb: PouchDB.Database }>
    >;
    onCouchdbSyncError: FrameworkEvent<
      FrameworkEventInit<SyncEvent, { localDb: PouchDB.Database; remoteDb: PouchDB.Database }>
    >;
    onCouchdbSyncComplete: FrameworkEvent<
      FrameworkEventInit<SyncEvent, { localDb: PouchDB.Database; remoteDb: PouchDB.Database }>
    >;
  }
}
