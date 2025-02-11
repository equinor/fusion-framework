import { BaseConfigBuilder } from '@equinor/fusion-framework-module';

import { type Theme, type Module, createTheme } from 'ag-grid-community';
import { type AgGridConfig, type IAgGridConfigurator } from './AgGridConfigurator.interface';

export class AgGridConfigurator
    extends BaseConfigBuilder<AgGridConfig>
    implements IAgGridConfigurator
{
    // local template variables
    #modules: Set<Module>;
    #theme: Theme | undefined;

    constructor(args: Partial<AgGridConfig> = {}) {
        super();

        // set default values
        this.#modules = new Set(args.modules || []);
        this.#theme = args.theme ?? createTheme();

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
            this.#theme = valueOrCallback(this.#theme ?? createTheme());
        } else {
            this.#theme = valueOrCallback ?? undefined;
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
