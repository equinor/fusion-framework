import { LicenseManager } from '@ag-grid-enterprise/core';

import { IAgGridConfigurator } from './configurator';

export interface IAgGridProvider {
    licenseKey: string;
}

export class AgGridProvider implements IAgGridProvider {
    protected _licenseKey: string;
    get licenseKey(): string {
        return this._licenseKey;
    }
    constructor(protected _config: IAgGridConfigurator, _provider?: IAgGridProvider) {
        if (_config.licenseKey) {
            this._licenseKey = _config.licenseKey;
        } else if (_provider?.licenseKey) {
            this._licenseKey = _provider?.licenseKey;
        } else {
            throw Error('please provide AG Grid license key');
        }
    }
    protected _init(): void {
        LicenseManager.setLicenseKey(this.licenseKey);
        // TODO - load style
    }
}
