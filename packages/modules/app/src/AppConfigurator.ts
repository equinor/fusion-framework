import {
  BaseConfigBuilder,
  type ConfigBuilderCallback,
  type ModuleInitializerArgs,
} from '@equinor/fusion-framework-module';
import type { HttpModule, IHttpClient } from '@equinor/fusion-framework-module-http';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

import { moduleKey } from './module';

import AppClient, { type IAppClient } from './AppClient';

/**
 * Resolved configuration for the app module.
 *
 * Produced by {@link AppConfigurator} during module initialization and consumed
 * by {@link AppModuleProvider} at runtime.
 */
export interface AppModuleConfig {
  /** HTTP client used to communicate with the Fusion app service API. */
  client: IAppClient;
  /** Base URI for fetching application script bundles (e.g., `'/apps-proxy'`). */
  assetUri?: string;
}

/**
 * Public interface for configuring the app module before initialization.
 *
 * Consumers use this interface (via the callback in {@link enableAppModule}) to
 * override the default HTTP client or asset URI.
 */
export interface IAppConfigurator {
  /**
   * Sets the app service client used to fetch manifests, configs, and settings.
   *
   * @param client_or_cb - A promise resolving to an {@link IAppClient}, or a callback
   *   that receives module initializer args and returns one.
   */
  setClient: (
    client_or_cb:
      | Promise<AppModuleConfig['client']>
      | ConfigBuilderCallback<AppModuleConfig['client']>,
  ) => void;

  /**
   * Sets the base URI used to proxy-load application script bundles.
   *
   * @param base_or_cb - A static URI string or a callback returning one.
   */
  setAssetUri: (base_or_cb: string | ConfigBuilderCallback<string>) => void;
}

/**
 * Configuration builder for the app module.
 *
 * Extends {@link BaseConfigBuilder} to assemble an {@link AppModuleConfig} during
 * framework initialization. If no explicit client is set, a default one is created
 * via service discovery. The default `assetUri` is `'/apps-proxy'`.
 */
export class AppConfigurator
  extends BaseConfigBuilder<AppModuleConfig>
  implements IAppConfigurator
{
  defaultExpireTime = 1 * 60 * 1000;

  /**
   * Creates the default HTTP client for the app service, preferring a pre-configured
   * client from the http module and falling back to service discovery.
   *
   * WARNING: this function will be remove in future
   *
   * @param init - Module initializer args providing access to the http and service discovery modules.
   * @returns A promise resolving to the {@link IHttpClient} used to communicate with the app service.
   */
  protected async _createHttpClient(
    init: ModuleInitializerArgs<IAppConfigurator, [HttpModule, ServiceDiscoveryModule]>,
  ): Promise<IHttpClient> {
    const http = await init.requireInstance('http');
    const serviceName = 'apps';
    /** check if the http provider has configure a client */
    if (http.hasClient(serviceName)) {
      return http.createClient(serviceName);
    }

    /** load service discovery module */
    const serviceDiscovery = await init.requireInstance('serviceDiscovery');

    // TODO(#5125) - remove when refactor portal service!
    /** resolve and create a client from discovery */
    return await serviceDiscovery.createClient(serviceName);
  }

  /**
   * Sets the app service client used to fetch manifests, configs, and settings.
   * @param client_or_cb - A promise resolving to an {@link IAppClient}, or a callback
   *   that receives module initializer args and returns one.
   */
  public setClient(
    client_or_cb:
      | Promise<AppModuleConfig['client']>
      | ConfigBuilderCallback<AppModuleConfig['client']>,
  ) {
    const cb = typeof client_or_cb === 'object' ? () => client_or_cb : client_or_cb;
    this._set('client', cb);
  }

  /**
   * Sets the base URI used to proxy-load application script bundles.
   *
   * TODO(#5132) - explain why, used in import of resources aka proxy url
   *
   * @param base_or_cb - A static URI string or a callback returning one.
   */
  public setAssetUri(base_or_cb: string | ConfigBuilderCallback<string>) {
    const cb = typeof base_or_cb === 'string' ? async () => base_or_cb : base_or_cb;
    this._set('assetUri', cb);
  }

  /**
   * Builds the resolved {@link AppModuleConfig}, applying default client and asset URI
   * when they haven't been explicitly configured.
   * @param init - Module initializer args used to build the default client.
   * @param initial - Optional initial partial configuration.
   * @returns The resolved module config.
   */
  protected _createConfig(
    init: ModuleInitializerArgs<IAppConfigurator, [HttpModule, ServiceDiscoveryModule]>,
    initial?: Partial<AppModuleConfig>,
  ) {
    // fall back to a default client created via the http/service discovery modules
    if (!this._has('client')) {
      this.setClient(async () => {
        const httpClient = await this._createHttpClient(init);
        const appClient = new AppClient(httpClient);
        return appClient;
      });
    }

    // fall back to the default proxy asset uri
    if (!this._has('assetUri')) {
      this.setAssetUri('/apps-proxy');
    }

    return super._createConfig(init, initial);
  }
}
