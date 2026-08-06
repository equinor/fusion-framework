import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableAppState } from '@equinor/fusion-framework-react-app/state';
import { PouchDbSyncStorage } from '@equinor/fusion-framework-module-state/storage';
import { createDefaultStorage } from '@equinor/fusion-framework-module-state/default-storage';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';

// Set in `.env` (see `.env.example`) to showcase replication against the local Docker
// CouchDB from `couchdb.sh` - unset, the state module falls back to the framework's
// default storage below, the same zero-config behavior any consuming app gets.
const couchdbUrl = import.meta.env.FUSION_SPA_COUCHDB_URL;

export const configure: AppModuleInitiator = (appConfigurator, { env }) => {
  enableAppState(appConfigurator, (config) => {
    // `onStateSync.*` events shown on this cookbook's pages come from the framework.
    if (couchdbUrl) {
      config.setStorage(
        new PouchDbSyncStorage({
          localDb: { name_or_instance: 'cookbook_app_state' },
          remoteDb: { name_or_instance: couchdbUrl },
          syncOptions: { live: true, retry: true, heartbeat: 10000, timeout: 30000 },
        }),
      );
      return;
    }
    // Use the real default storage, but with a shorter pull interval than production's
    // (see `createDefaultStorage`'s own default) - nobody wants to wait a minute to see
    // a poll happen while previewing this cookbook.
    config.setStorage((args) =>
      createDefaultStorage(appConfigurator.manifest.appKey, args, { intervalMs: 10_000 }),
    );
  });

  // Enable navigation module (allow navigation between pages)
  enableNavigation(appConfigurator, env.basename);
};

export default configure;
