import { BaseConfigBuilder } from '@equinor/fusion-framework-module';

import type { Theme, Module } from 'ag-grid-community';
import type { AgGridConfig, IAgGridConfigurator } from './AgGridConfigurator.interface';
import { createTheme } from './themes';

export class AgGridConfigurator
  extends BaseConfigBuilder<AgGridConfig>
  implements IAgGridConfigurator
{
  // local template variables
  #modules: Set<Module>;
  #theme: () => Theme;

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

  setLicenseKey(value: string | undefined): void {
    this._set('licenseKey', async () => value);
  }

  setTheme(valueOrCallback: Theme | ((baseTheme: Theme) => Theme) | null): void {
    if (typeof valueOrCallback === 'function') {
      this._set('theme', async () => () => valueOrCallback(this.#theme()));
    } else {
      this._set('theme', async () => () => valueOrCallback as Theme);
    }
  }

  setModules(value: Module[]): void {
    this.#modules = new Set(value);
  }

  addModule(value: Module): void {
    this.#modules.add(value);
  }

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
