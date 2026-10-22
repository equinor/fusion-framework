import { LicenseManager } from 'ag-grid-enterprise';
import { ModuleRegistry, provideGlobalGridOptions, type Theme } from 'ag-grid-community';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';

import type { AgGridConfig } from './AgGridConfigurator.interface.js';
import { applyThemeShim } from './apply-theme-shim.js';
import { observeLegacyAdd } from './observe-legacy-add.js';
import { reportLegacyAdd } from './report-legacy-add.js';
import { version } from './version.js';

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
  /**
   * Connects optional host telemetry for compatibility-shim usage diagnostics.
   *
   * Called by the module after initialization; `undefined` leaves AG Grid without diagnostics.
   * @param telemetry - Available host telemetry provider.
   */
  connectTelemetry?(telemetry: ITelemetryProvider | undefined): void;
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
 *
 * Extends {@link BaseModuleProvider} so the module configurator recognises it
 * as a standard provider and can report the package `version`.
 */
export class AgGridProvider extends BaseModuleProvider<AgGridConfig> implements IAgGridProvider {
  #stopLegacyAddObservation?: VoidFunction;

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
    super({ version, config: _config });
    this._init();
  }

  /**
   * Reports the first use of the patched legacy `add()` during this provider's lifecycle.
   *
   * One record per provider bounds volume regardless of how many grids mount; the observation
   * ends after that record, on reconnection, or on disposal, and never changes grid behavior.
   *
   * @param telemetry - Available host telemetry provider; `undefined` disables the diagnostic.
   */
  public connectTelemetry(telemetry: ITelemetryProvider | undefined): void {
    this.#stopLegacyAddObservation?.();
    this.#stopLegacyAddObservation = undefined;
    // Without telemetry the shim keeps working; there is simply nothing to report to.
    if (!telemetry) {
      return;
    }
    const stopObserving = observeLegacyAdd(() => {
      stop();
      reportLegacyAdd(telemetry);
    });
    const removeTeardown = this._addTeardown(stopObserving);
    const stop = (): void => {
      stopObserving();
      removeTeardown();
    };
    this.#stopLegacyAddObservation = stop;
  }

  /**
   * Applies the AG Grid configuration: theme shim, license key, global grid
   * options, and module registration.
   */
  protected _init(): void {
    applyThemeShim();

    // License key is optional — AG Grid falls back to its community/trial behavior without one
    if (this.licenseKey) {
      LicenseManager.setLicenseKey(this.licenseKey);
    }
    provideGlobalGridOptions({
      theme: this._config.theme?.(),
    });

    // Only register modules when explicitly configured, to avoid overriding globally registered modules
    if (this._config.modules) {
      ModuleRegistry.registerModules(this._config.modules);
    }
  }
}
