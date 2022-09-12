import { AnyModule, ModuleConsoleLogger, ModulesConfigurator } from '@equinor/fusion-framework-module';

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
    constructor(
        args?: Partial<{
            http: Parameters<typeof configureHttp>;
            msal: Parameters<typeof configureMsal>;
        }>
    ) {
        super([event, http, auth, disco]);
        if (args) {
            args.http && this.configureHttp(...args.http);
            args.msal && this.configureMsal(...args.msal);
        }
        this.logger = new ModuleConsoleLogger('FrameworkConfigurator');
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
