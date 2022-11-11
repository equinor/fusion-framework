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
import type { HttpClientMsal } from '@equinor/fusion-framework-module-http/client';

import auth, { configureMsal } from '@equinor/fusion-framework-module-msal';

import context from '@equinor/fusion-framework-module-context';

import app from '@equinor/fusion-framework-module-app';

import disco from '@equinor/fusion-framework-module-service-discovery';
import services from '@equinor/fusion-framework-module-services';

import { FusionModules } from './types';

export class FusionConfigurator<
    TModules extends Array<AnyModule> = [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TRef = any
> extends ModulesConfigurator<FusionModules<TModules>, TRef> {
    constructor() {
        super([event, auth, http, disco, services, app, context]);
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

    public configureServiceDiscovery(args: { client: HttpClientOptions<HttpClientMsal> }) {
        this.configureHttpClient('service_discovery', args.client);
    }
}
