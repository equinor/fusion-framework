import type { IStorage } from './storage/Storage.interface.js';

/**
 * Configuration options for the StateModule.
 *
 * @property storage - An implementation of the IStorage interface used for persisting state.
 */
export interface StateModuleConfig {
  storage: IStorage;
}
