import { Fusion, FusionModulesInstance } from '@equinor/fusion-framework';
import {
    AnyModule,
    ModuleConsoleLogger,
    ModulesConfigurator,
} from '@equinor/fusion-framework-module';

import event from '@equinor/fusion-framework-module-event';
import http, { configureHttpClient, configureHttp } from '@equinor/fusion-framework-module-http';
import auth, { configureMsal } from '@equinor/fusion-framework-module-msal';
import appConfig from '@equinor/fusion-framework-module-app-config';
import type { IServiceDiscoveryProvider } from '@equinor/fusion-framework-module-service-discovery';

import { AppModules, IAppConfigurator } from './types';

export class AppConfigurator<
        TModules extends Array<AnyModule> | unknown = unknown,
        TRef extends FusionModulesInstance = FusionModulesInstance
    >
    extends ModulesConfigurator<AppModules<TModules>, TRef>
    implements IAppConfigurator<TModules, TRef>
{
    constructor(
        args?: Partial<{
            http: Parameters<typeof configureHttp>;
            msal: Parameters<typeof configureMsal>;
        }>
    ) {
        super([event, http, auth, appConfig]);
        if (args) {
            args.http && this.configureHttp(...args.http);
            args.msal && this.configureMsal(...args.msal);
        }
        this.logger = new ModuleConsoleLogger('AppConfigurator');
    }

    public configureHttp(...args: Parameters<typeof configureHttp>) {
        this.addConfig(configureHttp(...args));
    }

    public configureHttpClient(...args: Parameters<typeof configureHttpClient>) {
        this.addConfig(configureHttpClient(...args));
    }

    public useFrameworkServiceClient(
        fusion: Fusion,
        serviceName: Parameters<IServiceDiscoveryProvider['configureClient']>[1]
    ): ReturnType<IServiceDiscoveryProvider['configureClient']> {
        return fusion.modules.serviceDiscovery.configureClient(
            this as AppConfigurator,
            serviceName
        );
    }

    public configureMsal(...args: Parameters<typeof configureMsal>) {
        this.addConfig(configureMsal(...args));
    }
}

export default AppConfigurator;
