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
 * Contract for configuring Fusion application modules.
 *
 * `IAppConfigurator` extends the base module configurator with application-specific
 * methods for setting up HTTP clients and integrating with Fusion service discovery.
 * Use this interface when typing configuration callbacks that receive the configurator.
 *
 * @template TModules - Additional application-specific modules to register beyond the defaults.
 * @template TRef - The resolved Fusion modules instance used as a reference during initialization.
 *
 * @example
 * ```ts
 * import type { IAppConfigurator } from '@equinor/fusion-framework-app';
 *
 * const configure = (configurator: IAppConfigurator) => {
 *   configurator.configureHttpClient('myApi', {
 *     baseUri: 'https://api.example.com',
 *     defaultScopes: ['api://client-id/.default'],
 *   });
 * };
 * ```
 */
export interface IAppConfigurator<
  TModules extends Array<AnyModule> | unknown = unknown,
  TRef extends FusionModulesInstance = FusionModulesInstance,
> extends IModulesConfigurator<AppModules<TModules>, TRef> {
  /**
   * Configure the HTTP module with custom settings.
   *
   * Delegates to the framework `configureHttp` helper. Use this when you need
   * low-level control over the HTTP module configuration. For most applications,
   * prefer {@link IAppConfigurator.configureHttpClient | configureHttpClient} instead.
   *
   * @param args - Arguments forwarded to the framework `configureHttp` function.
   */
  configureHttp(...args: Parameters<typeof configureHttp>): void;

  /**
   * Register a named HTTP client with explicit base URI and authentication scopes.
   *
   * Use this method when the application needs to call a specific API endpoint
   * that is not provided through Fusion service discovery.
   *
   * @param args - Arguments forwarded to the framework `configureHttpClient` function.
   *
   * @example
   * ```ts
   * configurator.configureHttpClient('myClient', {
   *   baseUri: 'https://foo.bar',
   *   defaultScopes: ['api://client-id/.default'],
   * });
   * ```
   */
  configureHttpClient(...args: Parameters<typeof configureHttpClient>): void;

  /**
   * Register a named HTTP client resolved through Fusion service discovery.
   *
   * The `serviceName` is looked up in the portal’s service-discovery registry at
   * initialization time. Base URI and default scopes are resolved automatically.
   * Use this instead of {@link IAppConfigurator.configureHttpClient | configureHttpClient}
   * when the service is registered with the Fusion portal.
   *
   * @param serviceName - Registered name of the service in Fusion service discovery.
   * @param options - Optional HTTP client overrides (headers, interceptors, etc.).
   *                  `baseUri` and `defaultScopes` are excluded because they are
   *                  resolved from service discovery.
   */
  // TODO - rename
  useFrameworkServiceClient(
    serviceName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Omit<HttpClientOptions<any>, 'baseUri' | 'defaultScopes'>,
  ): void;
}

/**
 * Configurator that bootstraps default Fusion application modules and provides
 * helper methods for HTTP client and service-discovery setup.
 *
 * `AppConfigurator` is created internally by {@link configureModules}. It registers
 * the `event`, `http`, and `msal` (auth) modules by default and reads any HTTP
 * endpoints declared in the application’s environment config.
 *
 * @template TModules - Additional application-specific modules beyond the defaults.
 * @template TRef - The resolved Fusion modules instance used as an initialization reference.
 * @template TEnv - The application environment descriptor (manifest, config, basename).
 *
 * @example
 * ```ts
 * // Typically used indirectly via configureModules:
 * import { configureModules } from '@equinor/fusion-framework-app';
 *
 * const initialize = configureModules((configurator) => {
 *   configurator.useFrameworkServiceClient('my-service');
 * });
 * ```
 */
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

  /**
   * Create an application configurator with default modules and environment.
   *
   * Registers the `event`, `http`, and `msal` modules and pre-configures any
   * HTTP clients declared in `env.config.endpoints`.
   *
   * @param env - The application environment containing manifest, config, and optional basename.
   */
  constructor(public readonly env: TEnv) {
    super([event, http, auth]);

    this._configureHttpClientsFromAppConfig();
  }

  /**
   * Read HTTP endpoint definitions from the application config and register each
   * one as a named HTTP client.
   *
   * Iterates over `env.config.endpoints` and calls
   * {@link IAppConfigurator.configureHttpClient | configureHttpClient} for each entry.
   */
  protected _configureHttpClientsFromAppConfig() {
    const { endpoints = {} } = this.env.config ?? {};
    for (const [key, { url, scopes }] of Object.entries(endpoints)) {
      this.configureHttpClient(key, {
        baseUri: url,
        defaultScopes: scopes,
      });
    }
  }

  /** {@inheritDoc IAppConfigurator.configureHttp} */
  public configureHttp(...args: Parameters<typeof configureHttp>): void {
    this.addConfig(configureHttp(...args));
  }

  /** {@inheritDoc IAppConfigurator.configureHttpClient} */
  public configureHttpClient(...args: Parameters<typeof configureHttpClient>): void {
    this.addConfig(configureHttpClient(...args));
  }

  /**
   * Register a named HTTP client whose base URI and scopes are resolved via
   * Fusion service discovery.
   *
   * Resolution priority (highest wins):
   * 1. Session overrides (user-specific URL / scopes)
   * 2. Application config (`env.config.endpoints`)
   * 3. Service-discovery registry
   *
   * If a client with the same `serviceName` is already registered (e.g. from
   * app config) and the service has **not** been overridden at session level,
   * a warning is logged and the existing configuration is kept.
   *
   * @param serviceName - Registered name of the service in Fusion service discovery.
   * @param options - Optional HTTP client overrides. `baseUri` and `defaultScopes`
   *                  are excluded because they come from service discovery.
   * @throws {Error} When the service cannot be resolved from service discovery.
   *
   * @example
   * ```ts
   * configurator.useFrameworkServiceClient('my-backend-service');
   * ```
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
