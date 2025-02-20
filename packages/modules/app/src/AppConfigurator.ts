import {
  BaseConfigBuilder,
  ConfigBuilderCallback,
  type ModuleInitializerArgs,
} from '@equinor/fusion-framework-module';
import type { HttpModule, IHttpClient } from '@equinor/fusion-framework-module-http';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

import { moduleKey } from './module';

import AppClient, { IAppClient } from './AppClient';

export interface AppModuleConfig {
  client: IAppClient;
  // uri which to fetch the assets from aka the bundle of the application
  assetUri?: string;
}

export interface IAppConfigurator {
  setClient: (
    client_or_cb:
      | Promise<AppModuleConfig['client']>
      | ConfigBuilderCallback<AppModuleConfig['client']>,
  ) => void;
  setAssetUri: (base_or_cb: string | ConfigBuilderCallback<string>) => void;
}

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
    /** check if the http provider has configure a client */
    if (http.hasClient(moduleKey)) {
      return http.createClient(moduleKey);
    } else {
      /** load service discovery module */
      const serviceDiscovery = await init.requireInstance('serviceDiscovery');

      // TODO - remove when refactor portal service!
      /** resolve and create a client from discovery */
      return await serviceDiscovery.createClient('apps');
    }
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
