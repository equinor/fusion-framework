export { StateProvider } from './StateProvider.js';
export { IStateProvider } from './StateProvider.interface.js';

export { StateModuleConfig } from './StateModuleConfig.js';
export { StateModuleConfigurator } from './StateModuleConfigurator.js';

export { enableStateModule } from './enable-state-module.js';

export { StateModule, module, module as default } from './StateModule.js';

export {
  StateChangeEvent,
  StateSyncEvent,
  StateOperationEvent,
  StateErrorEvent,
  type StateEventType,
  type StateChangeEventType,
  type StateSyncEventType,
} from './events/index.js';

export { observePouchDbSync } from './storage/observe-pouchdb-sync.js';
export { observePouchDbChange } from './storage/observe-pouchdb-change.js';

export {
  AllowedValue,
  type StateItem,
} from './types.js';

export type {
  SyncResult,
  SyncReplicationResult,
} from './storage/types.js';
