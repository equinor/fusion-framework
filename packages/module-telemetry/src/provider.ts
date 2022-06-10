import { IAuthProvider } from '@equinor/fusion-framework-module-msal';
import { ApplicationInsights, ITelemetryItem } from '@microsoft/applicationinsights-web';

import { ITelemetryConfigurator } from './configurator';

export interface ITelemetryProvider {
    createClient(): ApplicationInsights;
}

export class TelemetryProvider implements ITelemetryProvider {
    constructor(protected _config: ITelemetryConfigurator, protected _auth: IAuthProvider) {}

    createClient(): ApplicationInsights {
        const { instrumentationKey } = this._config;
        const client = new ApplicationInsights({
            config: {
                instrumentationKey,
            },
        });

        client.loadAppInsights();

        if (this._auth && this._auth.defaultAccount) {
            // TODO - local or home account??
            client.setAuthenticatedUserContext(this._auth.defaultAccount.localAccountId);
        } else {
            console.warn('no authorized user provided!');
        }
        client.addTelemetryInitializer(this._addTelemetryInitializer.bind(this));

        return client;
    }

    protected _addTelemetryInitializer(item: ITelemetryItem): void | boolean {
        const { defaultTags } = this._config;
        defaultTags && Object.assign(item.tags || [], defaultTags);
    }
}
