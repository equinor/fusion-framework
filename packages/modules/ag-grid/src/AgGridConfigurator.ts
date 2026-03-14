import { BaseConfigBuilder } from '@equinor/fusion-framework-module';

import type { Theme, Module } from 'ag-grid-community';
import type { AgGridConfig, IAgGridConfigurator } from './AgGridConfigurator.interface';
import { createTheme } from './themes';

/**
 * Configuration builder for the AG Grid Fusion module.
 *
 * Extends {@link BaseConfigBuilder} and implements {@link IAgGridConfigurator} to
 * collect license key, theme, and module settings that are resolved into an
 * {@link AgGridConfig} during module initialisation.
 *
 * @remarks
 * Consumers do not instantiate this class directly — it is created by the AG Grid
 * module definition. Use the {@link IAgGridConfigurator} callback provided by
 * {@link enableAgGrid} to interact with this builder.
 */
export class AgGridConfigurator
  extends BaseConfigBuilder<AgGridConfig>
  implements IAgGridConfigurator
{
  #modules: Set<Module>;
  #theme: () => Theme;

  /**
   * Creates a new AG Grid configuration builder.
   *
   * @param args - Optional partial configuration to seed defaults (license key, theme factory, modules).
   */
  constructor(args: Partial<AgGridConfig> = {}) {
    super();

    // set default values
    this.#modules = new Set(args.modules || []);
    this.#theme = args.theme ?? (() => createTheme());

    // set config properties
    this._set('modules', async () => [...this.#modules]);
    this._set('theme', async () => this.#theme);
    this.setLicenseKey(args.licenseKey);
  }

  /** {@inheritDoc IAgGridConfigurator.setLicenseKey} */
  setLicenseKey(value: string | undefined): void {
    this._set('licenseKey', async () => value);
  }

  /** {@inheritDoc IAgGridConfigurator.setTheme} */
  setTheme(valueOrCallback: Theme | ((baseTheme: Theme) => Theme) | null): void {
    if (typeof valueOrCallback === 'function') {
      this._set('theme', async () => () => valueOrCallback(this.#theme()));
    } else {
      this._set('theme', async () => () => valueOrCallback as Theme);
    }
  }

  /** {@inheritDoc IAgGridConfigurator.setModules} */
  setModules(value: Module[]): void {
    this.#modules = new Set(value);
  }

  /** {@inheritDoc IAgGridConfigurator.addModule} */
  addModule(value: Module): void {
    this.#modules.add(value);
  }

  /** {@inheritDoc IAgGridConfigurator.removeModule} */
  removeModule(value: Module | string): void {
    const module = [...this.#modules].find(
      (module) => module === value || module.moduleName === value,
    );

    if (module) {
      this.#modules.delete(module);
    } else {
      console.warn(`Module ${value} not found.`);
    }
  }
}
