import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';

import type { ObservableInput } from 'rxjs';

export type StateWithReplicaConfig = {
  localDb: PouchDB.Database;
  remoteDb: PouchDB.Database;
};

/** Configures the local and remote databases used for state replication. */
export class StateWithReplicaConfigurator extends BaseConfigBuilder<StateWithReplicaConfig> {
  /**
   * Sets the remote database used for replication.
   *
   * @param db - The remote database connection.
   */
  setRemote(db: PouchDB.Database) {
    this._set('remoteDb', db);
  }

  /**
   * Sets the local database used for application state.
   *
   * @param db - The local database connection.
   */
  setLocal(db: PouchDB.Database) {
    this._set('localDb', db);
  }

  /**
   * Validates that both database connections are configured.
   *
   * @param config - The partial replication configuration.
   * @param _init - Configuration initialization context.
   * @returns The validated configuration input.
   * @throws If either database connection is missing.
   */
  protected _processConfig(
    config: Partial<StateWithReplicaConfig>,
    _init: ConfigBuilderCallbackArgs,
  ): ObservableInput<StateWithReplicaConfig> {
    // Require local storage before the provider can persist application state.
    if (!this._has('localDb')) {
      throw Error('Local database is required');
    }
    // Require a remote endpoint before the provider can start replication.
    if (!this._has('remoteDb')) {
      throw Error('Remote database is required');
    }
    return super._processConfig(config, _init);
  }
}

export default StateWithReplicaConfigurator;
