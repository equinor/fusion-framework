import PouchDB from 'pouchdb';
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';

import { enableModule as enableStateWithReplicationModule } from './modules/app-state-with-replication';

export const configure: AppModuleInitiator = async (appConfigurator, { env }) => {
  // Enable the state module with custom CouchDB replication configuration
  enableStateWithReplicationModule(appConfigurator, async (config) => {
    // Set up local PouchDB
    const localDb = new PouchDB('cookbook_app_state', {
      auto_compaction: true,
    });
    config.setLocal(localDb);

    // Set up remote CouchDB
    const remoteDb = new PouchDB('http://admin:admin@localhost:5984/cookbooks_app_state');
    config.setRemote(remoteDb);
  });

  // Enable navigation module (allow navigation between pages)
  enableNavigation(appConfigurator, env.basename);
};

export default configure;
