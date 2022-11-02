import {
    AnyModule,
    ModuleConsoleLogger,
    ModulesConfigurator,
} from '@equinor/fusion-framework-module';

import event from '@equinor/fusion-framework-module-event';

import http, {
    configureHttpClient,
    configureHttp,
    HttpClientOptions,
} from '@equinor/fusion-framework-module-http';

import auth, { configureMsal } from '@equinor/fusion-framework-module-msal';

import context from '@equinor/fusion-framework-module-context';

import app from '@equinor/fusion-framework-module-app';

import disco from '@equinor/fusion-framework-module-service-discovery';

import { FusionModules } from './types';

export class FusionConfigurator<
    TModules extends Array<AnyModule> = [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TRef = any
> extends ModulesConfigurator<FusionModules<TModules>, TRef> {
    constructor() {
        super([event, http, auth, disco, app, context]);
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
