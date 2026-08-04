import { from, lastValueFrom } from 'rxjs';

import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
  type ConfigBuilderCallback,
} from '@equinor/fusion-framework-module';

import type { ObservableInput } from 'rxjs';
import type { IStorage } from './storage/index.js';
import type { StateModuleConfig } from './StateModuleConfig.js';
import { validateStateModuleConfig } from './validate-state-module-config.js';

/**
 * Interface for configuring the state module.
 *
 * Provides methods to customize the storage mechanism used by the state module.
 */
export interface IStateModuleConfigurator {
  /**
   * Specifies the storage mechanism for the state module.
   * @param storage_configuration The storage implementation or a callback that returns it.
   */
  setStorage(storage_configuration: IStorage | ConfigBuilderCallback<IStorage>): void;

  /**
   * Sets the identity (e.g. app key) used to scope the default storage's local keys
   * and remote sync path, so unrelated callers of the state module never share state.
   *
   * Has no effect once `setStorage` has been called. Required for the default
   * PouchDB-backed storage to be built at all — without it, the module falls back
   * to requiring an explicit `setStorage` call.
   *
   * @param name - The caller-supplied identity, e.g. an app or widget key.
   */
  setName(name: string): void;
}

/** Builds and validates configuration for the state module. */
export class StateModuleConfigurator
  extends BaseConfigBuilder<StateModuleConfig>
  implements IStateModuleConfigurator
{
  #name?: string;

  /**
   * Configures the storage mechanism for the state module.
   *
   * @param storage_configuration - An instance of `IStorage` or a callback function that returns an `IStorage` configuration.
   * If a callback is provided, it will be used to lazily resolve the storage configuration.
   */
  public setStorage(storage_configuration: IStorage | ConfigBuilderCallback<IStorage>): void {
    this._set('storage', storage_configuration);
  }

  /**
   * Sets the identity used to scope the default storage's local keys and remote sync path.
   * @param name - The caller-supplied identity, e.g. an app or widget key.
   */
  public setName(name: string): void {
    this.#name = name;
  }

  /**
   * Falls back to a default PouchDB-backed storage (optionally synced with the Fusion
   * App State backend) when the consumer never called {@link setStorage}, and did call
   * {@link setName}. Without a name, no safe default can be scoped, so none is built.
   *
   * @remarks
   * The default is loaded via dynamic import so that `pouchdb` and the optional
   * `serviceDiscovery`/`auth` modules are never bundled for consumers who always
   * provide their own storage.
   *
   * @param init - The configuration builder callback arguments.
   * @param initial - An optional partial configuration to use as the initial state.
   * @returns An observable that emits the processed configuration.
   */
  protected _createConfig(
    init: ConfigBuilderCallbackArgs,
    initial?: Partial<StateModuleConfig>,
  ): ObservableInput<StateModuleConfig> {
    // Only fall back to the default storage when the consumer hasn't set one explicitly,
    // and a name was provided to scope it - otherwise leave `storage` unset entirely.
    if (!this._has('storage') && !initial?.storage && this.#name) {
      const name = this.#name;
      this._set('storage', async (args) => {
        const { createDefaultStorage } = await import('./create-default-storage.js');
        return createDefaultStorage(name, args);
      });
    }
    return super._createConfig(init, initial);
  }

  /**
   * Resolves and validates the state module configuration.
   *
   * @param config - The partial configuration accumulated by the builder.
   * @param _init - Module initialization context used by deferred callbacks.
   * @returns The validated state module configuration.
   * @throws {Error} When storage configuration is missing or invalid.
   */
  protected async _processConfig(
    config: Partial<Record<string, unknown>>,
    _init: ConfigBuilderCallbackArgs,
  ): Promise<StateModuleConfig> {
    // Fail early so storage initialization cannot proceed without a backend.
    if (!config.storage) {
      throw new Error('Storage configuration is required');
    }

    // Reject malformed storage implementations before the base builder resolves callbacks.
    if (!validateStateModuleConfig(config)) {
      throw new Error('Invalid state module configuration');
    }

    return lastValueFrom(from(super._processConfig(config, _init)));
  }
}

export default StateModuleConfigurator;

