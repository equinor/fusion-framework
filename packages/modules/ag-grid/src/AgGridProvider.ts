import { LicenseManager } from 'ag-grid-enterprise';
import { ModuleRegistry, provideGlobalGridOptions, type Theme } from 'ag-grid-community';

import type { AgGridConfig } from './AgGridConfigurator.interface';
import { applyThemeShim } from './apply-theme-shim';

/**
 * Public contract for the resolved AG Grid module provider.
 *
 * Exposes the active license key and theme after module initialisation.
 * Obtain an instance through the Fusion module system
 * (e.g. `modules.agGrid` on a framework or app instance).
 */
export interface IAgGridProvider {
  /** AG Grid enterprise license key, if one was configured. */
  readonly licenseKey?: string;
  /** The active AG Grid {@link Theme} applied globally. */
  readonly theme?: Theme;
}

/**
 * Runtime provider for the AG Grid Fusion module.
 *
 * Created during module initialisation. Registers the license key, global theme,
 * and AG Grid feature modules with the AG Grid `ModuleRegistry` and
 * `LicenseManager`.
 *
 * @remarks
 * This class also applies the {@link applyThemeShim | theme shim} to work around
 * `agStyleInjectionState` inconsistencies in module-federation setups.
 */
export class AgGridProvider implements IAgGridProvider {
  /**
   * The AG Grid enterprise license key, if configured.
   *
   * @returns The license key string, or `undefined` when no key was provided.
   */
  get licenseKey(): string | undefined {
    return this._config.licenseKey;
  }

  /**
   * The active AG Grid theme resolved from configuration.
   *
   * @returns The current {@link Theme}, or `undefined` when no theme was configured.
   */
  get theme(): Theme | undefined {
    return this._config.theme?.();
  }

  /**
   * Creates a new AG Grid provider and immediately applies the configuration.
   *
   * @param _config - The resolved AG Grid configuration produced by {@link AgGridConfigurator}.
   */
  constructor(protected _config: AgGridConfig) {
    this._init();
  }

  /**
   * Applies the AG Grid configuration: theme shim, license key, global grid
   * options, and module registration.
   */
  protected _init(): void {
    applyThemeShim();

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
