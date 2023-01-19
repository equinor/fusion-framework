import { FusionModulesInstance } from '@equinor/fusion-framework';
import {
    AnyModule,
    IModulesConfigurator,
    ModuleConsoleLogger,
    ModulesConfigurator,
} from '@equinor/fusion-framework-module';

import event from '@equinor/fusion-framework-module-event';
import http, { configureHttpClient, configureHttp } from '@equinor/fusion-framework-module-http';
import auth, { configureMsal } from '@equinor/fusion-framework-module-msal';

import { WidgetModules } from './types';

/**
 * Configurator for configuring application modules
 *
 * @template TModules Addition modules
 * @template TRef usually undefined, optional references
 */
export interface IWidgetConfigurator<
    TModules extends Array<AnyModule> | unknown = unknown,
    TRef extends FusionModulesInstance = FusionModulesInstance
> extends IModulesConfigurator<WidgetModules<TModules>, TRef> {
    /**
     * [optional]
     * enable/configure the http module
     */
    configureHttp(...args: Parameters<typeof configureHttp>): void;

    /**
     * [optional]
     * Configure a named http client.
     * @example
     * ```ts
     configurator.configureHttpClient(
        'myClient', 
        { 
            baseUri: 'https://foo.bar', 
            defaultScopes: ['client-id/.default'] 
        }
    );
     * ```
     */
    configureHttpClient(...args: Parameters<typeof configureHttpClient>): void;

    /**
     * [required]
     * Setup of MSAL auth module
     * @example
     * ```ts
     configurator.configureMsal(
        {
            tenantId: '{TENANT_ID}',
            clientId: '{CLIENT_ID}',
            redirectUri: '/authentication/login-callback',
        },
        { requiresAuth: true }
    );
     * ```
     */
    configureMsal(...args: Parameters<typeof configureMsal>): void;

    /**
     * [optional]
     *
     * configure a http client which is resolved by service discovery
     *
     * @param serviceName - name of the service to use
     */
    // TODO - rename
    useFrameworkServiceClient(serviceName: string): void;
}

export class WidgetConfigurator<
        TModules extends Array<AnyModule> | unknown = unknown,
        TRef extends FusionModulesInstance = FusionModulesInstance
    >
    extends ModulesConfigurator<WidgetModules<TModules>, TRef>
    implements IWidgetConfigurator<TModules, TRef>
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

export default WidgetConfigurator;
