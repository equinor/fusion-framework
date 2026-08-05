import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableAppState } from '@equinor/fusion-framework-react-app/state';
import { PouchDbSyncStorage } from '@equinor/fusion-framework-module-state/storage';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';

// Set in `.env` (see `.env.example`) to showcase replication against the local Docker
// CouchDB from `couchdb.sh` - unset, the state module falls back to its own default
// storage, the same zero-config behavior any consuming app gets.
const couchdbUrl = import.meta.env.FUSION_SPA_COUCHDB_URL;

export const configure: AppModuleInitiator = (appConfigurator, { env }) => {
  enableAppState(
    appConfigurator,
    couchdbUrl
      ? (config) => {
          // `onStateSync.*` events shown on this cookbook's pages come from the framework.
          config.setStorage(
            new PouchDbSyncStorage({
              localDb: { name_or_instance: 'cookbook_app_state' },
              remoteDb: { name_or_instance: couchdbUrl },
              syncOptions: { live: true, retry: true, heartbeat: 10000, timeout: 30000 },
            }),
          );
        }
      : undefined,
  );

  // Enable navigation module (allow navigation between pages)
  enableNavigation(appConfigurator, env.basename);
};

export default configure;
