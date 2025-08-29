import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';

import type { ObservableInput } from 'rxjs';

export type StateWithReplicaConfig = {
  localDb: PouchDB.Database;
  remoteDb: PouchDB.Database;
};

export class StateWithReplicaConfigurator extends BaseConfigBuilder<StateWithReplicaConfig> {
  setRemote(db: PouchDB.Database) {
    this._set('remoteDb', db);
  }
  setLocal(db: PouchDB.Database) {
    this._set('localDb', db);
  }

  protected _processConfig(
    config: Partial<StateWithReplicaConfig>,
    _init: ConfigBuilderCallbackArgs,
  ): ObservableInput<StateWithReplicaConfig> {
    if (!this._has('localDb')) {
      throw Error('Local database is required');
    }
    if (!this._has('remoteDb')) {
      throw Error('Remote database is required');
    }
    return super._processConfig(config, _init);
  }
}

export default StateWithReplicaConfigurator;
