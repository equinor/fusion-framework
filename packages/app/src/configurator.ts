import { Fusion } from '@equinor/fusion-framework';
import { AnyModule, ModulesConfigurator } from '@equinor/fusion-framework-module';

import event from '@equinor/fusion-framework-module-event';
import http, { configureHttpClient, configureHttp } from '@equinor/fusion-framework-module-http';
import auth, { configureMsal } from '@equinor/fusion-framework-module-msal';
import disco from '@equinor/fusion-framework-module-service-discovery';

import { AppModules, IAppConfigurator } from './types';

export class AppConfigurator<TModules extends Array<AnyModule> = [], TRef extends Fusion = Fusion>
    extends ModulesConfigurator<AppModules<TModules>, TRef>
    implements IAppConfigurator<TModules, TRef>
{
    protected _requiredModules = [event, http, auth, disco];

    constructor(
        args?: Partial<{
            http: Parameters<typeof configureHttp>;
            msal: Parameters<typeof configureMsal>;
        }>
    ) {
        super();
        if (args) {
            args.http && this.configureHttp(...args.http);
            args.msal && this.configureMsal(...args.msal);
        }
    }

    public configureHttp(...args: Parameters<typeof configureHttp>) {
        this.addConfig(configureHttp(...args));
    }

    public configureHttpClient(...args: Parameters<typeof configureHttpClient>) {
        this.addConfig(configureHttpClient(...args));
    }

    public configureMsal(...args: Parameters<typeof configureMsal>) {
        this.addConfig(configureMsal(...args));
    }
}

export default AppConfigurator;
