import type { IStorage } from './storage/Storage.interface.js';

/**
 * Zod schema for the IStorage interface.
 *
 * @see {@link IStorage} - `@equinor/fusion-framework-module-state/storage`
 */
/**
 * Configuration options for the StateModule.
 *
 * @property storage - An implementation of the IStorage interface used for persisting state.
 */
export interface StateModuleConfig {
  storage: IStorage;
}

/**
 * Validates whether the provided configuration object conforms to the `StateModuleConfig` schema.
 *
 * @param config - The configuration object to validate.
 * @returns `true` if the configuration is a valid `StateModuleConfig`, otherwise `false`.
 */
