import { LicenseManager } from 'ag-grid-enterprise';
import {
  createTheme,
  ModuleRegistry,
  provideGlobalGridOptions,
  type Theme,
} from 'ag-grid-community';

import type { AgGridConfig } from './AgGridConfigurator.interface';

export interface IAgGridProvider {
  readonly licenseKey?: string;
  readonly theme?: Theme;
}

export class AgGridProvider implements IAgGridProvider {
  /**
   * Retrieves the license key from the configuration.
   *
   * @returns {string | undefined} The license key if it exists, otherwise undefined.
   */
  get licenseKey(): string | undefined {
    return this._config.licenseKey;
  }

  /**
   * Retrieves the current theme configuration.
   *
   * @returns {Theme | undefined} The current theme if configured, otherwise undefined.
   */
  get theme(): Theme | undefined {
    return this._config.theme?.();
  }

  constructor(protected _config: AgGridConfig) {
    this._init();
  }

  protected _init(): void {
    if (this.licenseKey) {
      LicenseManager.setLicenseKey(this.licenseKey);
    }
    provideGlobalGridOptions({
      theme: this._config.theme?.(),
    });

    if (this._config.modules) {
      ModuleRegistry.registerModules(this._config.modules);
    }
  }
}
