import { AnyModule, ModulesConfigurator } from '@equinor/fusion-framework-module';

import event from '@equinor/fusion-framework-module-event';
import http, {
    configureHttpClient,
    configureHttp,
    HttpClientOptions,
} from '@equinor/fusion-framework-module-http';
import auth, { configureMsal } from '@equinor/fusion-framework-module-msal';
import disco from '@equinor/fusion-framework-module-service-discovery';

import { FusionModules } from './types';

export class FusionConfigurator<
    TModules extends Array<AnyModule> = [],
    TRef = any
> extends ModulesConfigurator<FusionModules<TModules>, TRef> {
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

    public configureServiceDiscovery(args: { client: HttpClientOptions }) {
        this.configureHttpClient('service_discovery', args.client);
    }
}
