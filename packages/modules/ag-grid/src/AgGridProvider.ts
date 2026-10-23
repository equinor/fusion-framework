import { LicenseManager } from 'ag-grid-enterprise';
import { ModuleRegistry, provideGlobalGridOptions, type Theme } from 'ag-grid-community';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type {
  ITelemetryProvider,
  TelemetryConnectable,
} from '@equinor/fusion-framework-module-telemetry';
import type { OperationalTelemetry } from '@equinor/fusion-framework-module-telemetry';

import type { AgGridConfig } from './AgGridConfigurator.interface.js';
import { applyThemeShim } from './apply-theme-shim.js';
import { observeLegacyAdd } from './observe-legacy-add.js';
import { version } from './version.js';

/**
 * Public contract for the resolved AG Grid module provider.
 *
 * Exposes the active license key and theme after module initialisation.
 * Obtain an instance through the Fusion module system
 * (e.g. `modules.agGrid` on a framework or app instance).
 */
export interface IAgGridProvider extends TelemetryConnectable {
  /** AG Grid enterprise license key, if one was configured. */
  readonly licenseKey?: string;
  /** The active AG Grid {@link Theme} applied globally. */
  readonly theme?: Theme;
  /**
   * Connects optional host telemetry for compatibility-shim usage diagnostics.
   *
   * Called by the module after initialization; `undefined` leaves AG Grid without diagnostics.
   * @param telemetry - Available host telemetry provider.
   * @returns Resolves once diagnostics are active, or immediately without telemetry.
   */
  connectTelemetry?(telemetry: ITelemetryProvider | undefined): Promise<void>;
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
  /** Increments on every (re)connection and on disposal, so stale async connections stop. */
  #connection = 0;
  #disposed = false;
  #telemetry?: OperationalTelemetry;

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
    // Disposal supersedes a connection that is still loading its reporter.
    this._addTeardown(() => {
      this.#connection++;
      this.#disposed = true;
      this.#telemetry?.disconnect();
    });
    this._init();
  }

  /**
   * Reports the first use of the patched legacy `add()` during this provider's lifecycle.
   *
   * One record per provider bounds volume regardless of how many grids mount; the observation
   * ends after that record, on reconnection, or on disposal, and never changes grid behavior.
   *
   * The reporter depends on the optional telemetry peer, so it is loaded only when a provider
   * is given; without telemetry the peer is never imported.
   *
   * @param telemetry - Available host telemetry provider; `undefined` disables the diagnostic.
   * @returns Resolves once the diagnostic is active, or immediately without telemetry.
   */
  public async connectTelemetry(telemetry: ITelemetryProvider | undefined): Promise<void> {
    const connection = ++this.#connection;
    this.#stopLegacyAddObservation?.();
    this.#stopLegacyAddObservation = undefined;
    this.#telemetry?.connect(undefined);
    // Without telemetry the shim keeps working; there is simply nothing to report to.
    if (!telemetry || this.#disposed) {
      return;
    }
    let handle: OperationalTelemetry;
    try {
      handle =
        this.#telemetry ??
        telemetry.scope?.('ag-grid') ??
        (
          await import('@equinor/fusion-framework-module-telemetry/utils')
        ).createOperationalTelemetry('ag-grid');
    } catch {
      console.warn('AG Grid compatibility telemetry is unavailable');
      return;
    }
    // A later connection, disconnection or disposal supersedes this one.
    if (connection !== this.#connection) {
      // Only a newly allocated, superseded handle needs releasing here.
      if (handle !== this.#telemetry) {
        handle.disconnect();
      }
      return;
    }
    this.#telemetry = handle;
    this.#telemetry.connect(telemetry);
    const stopObserving = observeLegacyAdd(() => {
      stop();
      this.#telemetry?.report({
        operation: 'legacy-add',
        outcome: 'success',
        notification: true,
        level: 'warning',
      });
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
