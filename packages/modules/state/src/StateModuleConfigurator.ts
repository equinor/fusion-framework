import { from, lastValueFrom, type ObservableInput } from 'rxjs';

import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
  type ConfigBuilderCallback,
} from '@equinor/fusion-framework-module';

import type { IStorage } from './storage/index.js';
import { validateStateModuleConfig, type StateModuleConfig } from './StateModuleConfig.js';

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

  protected async _processConfig(
    config: Partial<Record<string, unknown>>,
    _init: ConfigBuilderCallbackArgs,
  ): Promise<StateModuleConfig> {
    if (!config.storage) {
      throw new Error('Storage configuration is required');
    }

    if (!validateStateModuleConfig(config)) {
      throw new Error('Invalid state module configuration');
    }

    return lastValueFrom(from(super._processConfig(config, _init)));
  }
}

export default StateModuleConfigurator;
