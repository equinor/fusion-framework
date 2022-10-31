import { FusionModulesInstance } from '@equinor/fusion-framework';
import {
    AnyModule,
    ModuleConsoleLogger,
    ModulesConfigurator,
} from '@equinor/fusion-framework-module';

import event from '@equinor/fusion-framework-module-event';
import http, { configureHttpClient, configureHttp } from '@equinor/fusion-framework-module-http';
import auth, { configureMsal } from '@equinor/fusion-framework-module-msal';

import { AppModules, IAppConfigurator } from './types';

export class AppConfigurator<
        TModules extends Array<AnyModule> | unknown = unknown,
        TRef extends FusionModulesInstance = FusionModulesInstance
    >
    extends ModulesConfigurator<AppModules<TModules>, TRef>
    implements IAppConfigurator<TModules, TRef>
{
    constructor() {
        super([event, http, auth]);
        this.logger = new ModuleConsoleLogger('AppConfigurator');
    }

    public configureHttp(...args: Parameters<typeof configureHttp>) {
        this.addConfig(configureHttp(...args));
    }

    public configureHttpClient(...args: Parameters<typeof configureHttpClient>) {
        this.addConfig(configureHttpClient(...args));
    }

    public useFrameworkServiceClient(serviceName: string): void {
        this.addConfig({
            module: http,
            configure: async (config, ref) => {
                const service = await ref?.serviceDiscovery.resolveService(serviceName);
                if (!service) {
                    throw Error(`failed to configure service [${serviceName}]`);
                }
                config.configureClient(serviceName, {
                    baseUri: service.uri,
                    defaultScopes: service.defaultScopes,
                });
            },
        });
    }

    public configureMsal(...args: Parameters<typeof configureMsal>) {
        this.addConfig(configureMsal(...args));
    }
}

export default AppConfigurator;
