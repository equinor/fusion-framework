import { LicenseManager } from 'ag-grid-enterprise';
import { ModuleRegistry, provideGlobalGridOptions, type Theme } from 'ag-grid-community';

import type { AgGridConfig } from './AgGridConfigurator.interface';

/**
 * Ensures "window.agStyleInjectionState" has the shape AG Grid v35+ expects.
 *
 * AG Grid changed "grids" from a "Set" (v34) to a "Map" (v35).
 * If the first bundle was v34, "grids" is a "Set" and v35 crashes
 * because it calls "Map" methods ("get", "set") on it.
 *
 * AG Grid captures a local reference to the state object at module
 * evaluation time, so replacing the global has no effect. Instead we
 * mutate the existing object in-place so all captured references see
 * the corrected "grids" property.
 */
const ensureStyleInjectionState = (): void => {
  if (typeof window !== 'object') return;
  const state = (window as Window & { agStyleInjectionState?: Record<string, unknown> })
    .agStyleInjectionState;
  if (!state) return;
  if (!(state.grids instanceof Map)) {
    state.grids = new Map();
  }
  if (!(state.map instanceof WeakMap)) {
    state.map = new WeakMap();
  }
};

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
    ensureStyleInjectionState();

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
