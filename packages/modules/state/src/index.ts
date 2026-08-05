export { StateProvider } from './StateProvider.js';
export { IStateProvider } from './StateProvider.interface.js';

export { StateModuleConfig } from './StateModuleConfig.js';
export {
  StateModuleConfigurator,
  type IStateModuleConfigurator,
} from './StateModuleConfigurator.js';

export { enableStateModule } from './enable-state-module.js';

export { StateModule } from './StateModule.js';
export { name } from './name.js';
export { module, module as default } from './module.js';
export { StateModuleConfigSchema } from './state-module-config-schema.js';
export { validateStateModuleConfig } from './validate-state-module-config.js';

export {
  StateChangeEvent,
  StateSyncEvent,
  StateOperationEvent,
  StateErrorEvent,
  type StateEventType,
  type StateChangeEventType,
  type StateSyncEventType,
} from './events/index.js';

export { observePouchDbSync } from './storage/observe-pouch-db-sync.js';
export { observePouchDbChange } from './storage/observe-pouch-db-change.js';

export {
  AllowedValue,
  type StateItem,
} from './types.js';

export type {
  SyncResult,
  SyncReplicationResult,
} from './storage/types.js';
