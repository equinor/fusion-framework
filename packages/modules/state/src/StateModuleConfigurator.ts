import { from, lastValueFrom } from 'rxjs';

import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
  type ConfigBuilderCallback,
} from '@equinor/fusion-framework-module';

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
}

/** Builds and validates configuration for the state module. */
export class StateModuleConfigurator
  extends BaseConfigBuilder<StateModuleConfig>
  implements IStateModuleConfigurator
{
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
