import type { FusionModulesInstance } from '@equinor/fusion-framework';
import {
  type AnyModule,
  type IModulesConfigurator,
  ModuleConsoleLogger,
  ModulesConfigurator,
} from '@equinor/fusion-framework-module';

import event from '@equinor/fusion-framework-module-event';
import http, { configureHttpClient, configureHttp } from '@equinor/fusion-framework-module-http';
import auth, { configureMsal } from '@equinor/fusion-framework-module-msal';

import type { WidgetModules } from './types';

/**
 * Configuration interface for setting up widget modules.
 *
 * `IWidgetConfigurator` extends `IModulesConfigurator` and provides
 * convenience methods for the most common widget configuration tasks:
 * HTTP clients, MSAL authentication, and service-discovery bindings.
 *
 * Widget authors receive an `IWidgetConfigurator` inside the callback
 * passed to {@link configureWidgetModules}. Use the methods below to
 * register infrastructure before the widget's modules are initialized.
 *
 * @template TModules - Additional modules to configure beyond the default widget module set.
 * @template TRef - Type of the parent Fusion modules instance used as a reference during configuration.
 *
 * @example
 * ```ts
 * import { configureWidgetModules } from '@equinor/fusion-framework-widget';
 *
 * export default configureWidgetModules((configurator) => {
 *   configurator.configureMsal({
 *     tenantId: 'my-tenant-id',
 *     clientId: 'my-client-id',
 *     redirectUri: '/authentication/login-callback',
 *   });
 *   configurator.configureHttpClient('myApi', {
 *     baseUri: 'https://api.example.com',
 *     defaultScopes: ['api://my-client-id/.default'],
 *   });
 * });
 * ```
 */
export interface IWidgetConfigurator<
  TModules extends Array<AnyModule> | unknown = unknown,
  TRef extends FusionModulesInstance = FusionModulesInstance,
> extends IModulesConfigurator<WidgetModules<TModules>, TRef> {
  /**
   * Configure the HTTP module with custom settings.
   *
   * Use this method when you need full control over the HTTP module
   * configuration. For registering individual named HTTP clients prefer
   * {@link IWidgetConfigurator.configureHttpClient | configureHttpClient}.
   *
   * @param args - Arguments forwarded to `configureHttp` from `@equinor/fusion-framework-module-http`.
   */
  configureHttp(...args: Parameters<typeof configureHttp>): void;

  /**
   * Register a named HTTP client with a base URI and default auth scopes.
   *
   * Named clients are resolved by key at runtime via the HTTP module.
   * This is the recommended way to set up API access for a widget.
   *
   * @param args - Arguments forwarded to `configureHttpClient` from `@equinor/fusion-framework-module-http`.
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
   * Configure MSAL authentication for the widget.
   *
   * This must be called when the widget needs to acquire tokens. Pass
   * tenant, client, and redirect information as required by the MSAL module.
   *
   * @param args - Arguments forwarded to `configureMsal` from `@equinor/fusion-framework-module-msal`.
   *
   * @example
   * ```ts
   * configurator.configureMsal(
   *   {
   *     tenantId: '{TENANT_ID}',
   *     clientId: '{CLIENT_ID}',
   *     redirectUri: '/authentication/login-callback',
   *   },
   *   { requiresAuth: true },
   * );
   * ```
   */
  configureMsal(...args: Parameters<typeof configureMsal>): void;

  /**
   * Register a named HTTP client whose base URI and scopes are resolved
   * from the Fusion service-discovery catalogue at runtime.
   *
   * Call this instead of {@link IWidgetConfigurator.configureHttpClient | configureHttpClient}
   * when the service URL is managed by the Fusion portal.
   *
   * @param serviceName - The service-discovery key (e.g. `'context'`, `'people'`).
   *
   * @throws {Error} When the service cannot be resolved from service-discovery.
   */
  useFrameworkServiceClient(serviceName: string): void;
}

/**
 * Default implementation of {@link IWidgetConfigurator}.
 *
 * `WidgetConfigurator` extends `ModulesConfigurator` and pre-registers the
 * core widget modules: **event**, **http**, and **auth (MSAL)**. Widget
 * authors rarely instantiate this class directly — it is created internally
 * by {@link configureWidgetModules}.
 *
 * @template TModules - Additional modules beyond the default widget module set.
 * @template TRef - Type of the parent Fusion modules instance.
 */
export class WidgetConfigurator<
    TModules extends Array<AnyModule> | unknown = unknown,
    TRef extends FusionModulesInstance = FusionModulesInstance,
  >
  extends ModulesConfigurator<WidgetModules<TModules>, TRef>
  implements IWidgetConfigurator<TModules, TRef>
{
  /** Create a new `WidgetConfigurator` with the default module set (event, http, auth). */
  constructor() {
    super([event, http, auth]);
  }

  /** @inheritdoc */
  public configureHttp(...args: Parameters<typeof configureHttp>) {
    this.addConfig(configureHttp(...args));
  }

  /** @inheritdoc */
  public configureHttpClient(...args: Parameters<typeof configureHttpClient>) {
    this.addConfig(configureHttpClient(...args));
  }

  /**
   * Register a named HTTP client resolved via Fusion service-discovery.
   *
   * At initialization time the service URI and scopes are fetched from the
   * parent Fusion runtime's service-discovery module. The resulting client
   * is available under the given `serviceName` key.
   *
   * @param serviceName - The service-discovery key to resolve (e.g. `'context'`).
   * @throws {Error} When the service cannot be resolved from service-discovery.
   */
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
          defaultScopes: service.scopes ?? service.defaultScopes,
        });
      },
    });
  }

  /** @inheritdoc */
  public configureMsal(...args: Parameters<typeof configureMsal>) {
    this.addConfig(configureMsal(...args));
  }
}

export default WidgetConfigurator;
