import { LicenseManager } from '@ag-grid-enterprise/core';

import { IAgGridConfigurator } from './configurator';

export interface IAgGridProvider {
    licenseKey?: string;
}

export class AgGridProvider implements IAgGridProvider {
    get licenseKey(): string | undefined {
        return this._config.licenseKey;
    }
    constructor(protected _config: IAgGridConfigurator) {
        this._init();
    }

    protected _init(): void {
        if (this.licenseKey) {
            LicenseManager.setLicenseKey(this.licenseKey);
        }
    }
}
