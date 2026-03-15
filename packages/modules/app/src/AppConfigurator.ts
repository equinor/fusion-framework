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
   * WARNING: this function will be remove in future
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

    // TODO - remove when refactor portal service!
    /** resolve and create a client from discovery */
    return await serviceDiscovery.createClient(serviceName);
  }

  public setClient(
    client_or_cb:
      | Promise<AppModuleConfig['client']>
      | ConfigBuilderCallback<AppModuleConfig['client']>,
  ) {
    const cb = typeof client_or_cb === 'object' ? () => client_or_cb : client_or_cb;
    this._set('client', cb);
  }

  // TODO - explain why, used in import of resources aka proxy url
  public setAssetUri(base_or_cb: string | ConfigBuilderCallback<string>) {
    const cb = typeof base_or_cb === 'string' ? async () => base_or_cb : base_or_cb;
    this._set('assetUri', cb);
  }

  protected _createConfig(
    init: ModuleInitializerArgs<IAppConfigurator, [HttpModule, ServiceDiscoveryModule]>,
    initial?: Partial<AppModuleConfig>,
  ) {
    if (!this._has('client')) {
      this.setClient(async () => {
        const httpClient = await this._createHttpClient(init);
        const appClient = new AppClient(httpClient);
        return appClient;
      });
    }

    if (!this._has('assetUri')) {
      this.setAssetUri('/apps-proxy');
    }

    return super._createConfig(init, initial);
  }
}
