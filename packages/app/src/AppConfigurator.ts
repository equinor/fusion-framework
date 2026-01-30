import type { FusionModulesInstance } from '@equinor/fusion-framework';

import {
  type AnyModule,
  type IModulesConfigurator,
  ModulesConfigurator,
} from '@equinor/fusion-framework-module';

import event from '@equinor/fusion-framework-module-event';

import http, {
  configureHttpClient,
  configureHttp,
  type HttpClientOptions,
} from '@equinor/fusion-framework-module-http';

import auth from '@equinor/fusion-framework-module-msal';

import type { AppEnv, AppModules } from './types';

/**
 * Configurator for configuring application modules
 *
 * @template TModules Addition modules
 * @template TRef usually undefined, optional references
 */
export interface IAppConfigurator<
  TModules extends Array<AnyModule> | unknown = unknown,
  TRef extends FusionModulesInstance = FusionModulesInstance,
> extends IModulesConfigurator<AppModules<TModules>, TRef> {
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
   * [optional]
   *
   * configure a http client which is resolved by service discovery
   *
   * @param serviceName - name of the service to use
   */
  // TODO - rename
  useFrameworkServiceClient(
    serviceName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Omit<HttpClientOptions<any>, 'baseUri' | 'defaultScopes'>,
  ): void;
}

export class AppConfigurator<
    TModules extends Array<AnyModule> | unknown = unknown,
    TRef extends FusionModulesInstance = FusionModulesInstance,
    TEnv extends AppEnv = AppEnv,
  >
  extends ModulesConfigurator<AppModules<TModules>, TRef>
  implements IAppConfigurator<TModules, TRef>
{
  /**
   * The class name used for event naming. This static property ensures
   * the name is preserved through compilation and minification.
   */
  static readonly className: string = 'AppConfigurator';

  constructor(public readonly env: TEnv) {
    super([event, http, auth]);

    this.configureHttpClientsFromAppConfig();
  }

  /**
   * Reads app config's endpoints and configure the endpoints as httpClients
   */
  protected configureHttpClientsFromAppConfig() {
    const endpoints = this.env.config ? this.env.config.getEndpoints() : {};
    for (const [key, { url, scopes }] of Object.entries(endpoints)) {
      this.configureHttpClient(key, {
        baseUri: url,
        defaultScopes: scopes,
      });
    }
  }

  public configureHttp(...args: Parameters<typeof configureHttp>) {
    this.addConfig(configureHttp(...args));
  }

  public configureHttpClient(...args: Parameters<typeof configureHttpClient>) {
    this.addConfig(configureHttpClient(...args));
  }

  /**
   * Configures a http client for the service `serviceName`.
   * The serviceName is looked up in ServiceDiscovery.
   * User can override url and scopes with session values.
   * App can override url and scopes with app config.
   *
   * Priority:
   * 1. Session overrides
   * 2. AppConfig
   * 3. ServiceDiscovery
   *
   * @see modules/service-discovery/src/client.ts
   * @see configureHttpClientsFromAppConfig()
   */
  public useFrameworkServiceClient(
    serviceName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Omit<HttpClientOptions<any>, 'baseUri' | 'defaultScopes'>,
  ): void {
    this.addConfig({
      module: http,
      configure: async (config, ref) => {
        // Service from serviceDiscovery with potential session override.
        const service = await ref?.serviceDiscovery.resolveService(serviceName);
        if (!service) {
          throw Error(`failed to configure service [${serviceName}]`);
        }

        // Check if serviceName is already configured (potentially with app-config)
        // If the service is session overridden - we need the configuration to run
        // as normal (the uri already updated).
        if (config.hasClient(serviceName) && !service.overridden) {
          console.warn(
            `${serviceName} is already configured, possibly by app.config.[ENV].ts.
             Overriding configurations may lead to unintended behaviour and should
             be reviewed carefully.`,
          );
          return;
        }
        config.configureClient(serviceName, {
          ...options,
          baseUri: service.uri,
          defaultScopes: service.defaultScopes,
        });
      },
    });
  }
}

export default AppConfigurator;
