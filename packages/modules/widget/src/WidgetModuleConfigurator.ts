import { BaseConfigBuilder, type ConfigBuilderCallback } from '@equinor/fusion-framework-module';
import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import { createDefaultClient } from './utils';
import type { IClient } from './types';

/**
 * Resolved configuration produced by {@link WidgetModuleConfigurator}.
 *
 * Contains the {@link IClient} used to fetch widget manifests and configs
 * from the backend API.
 */
export type WidgetModuleConfig = {
  /** HTTP client abstraction for widget API calls. */
  client: IClient;
};

/**
 * Callback signature accepted by {@link enableWidgetModule} for customizing
 * the widget module configuration.
 *
 * @param builder - The {@link WidgetModuleConfigurator} instance to configure.
 */
export type WidgetModuleConfigBuilderCallback = (
  builder: WidgetModuleConfigurator,
) => void | Promise<void>;

/**
 * Configuration builder for the widget module.
 *
 * Extends `BaseConfigBuilder` to produce a {@link WidgetModuleConfig}. If no
 * custom client is provided via {@link setClient}, a default HTTP client is
 * created from the `apps` service-discovery endpoint.
 *
 * @example
 * ```typescript
 * enableWidgetModule(configurator, (builder) => {
 *   builder.setClient(async () => myCustomClient);
 * });
 * ```
 */
export class WidgetModuleConfigurator extends BaseConfigBuilder<WidgetModuleConfig> {
  /** Default cache expiration time in milliseconds (1 minute). */
  defaultExpireTime = 1 * 60 * 1000;

  /**
   * Registers a custom {@link IClient} factory for the widget module.
   *
   * @param cb - Callback that receives config-builder args and returns an
   *   `IClient` instance (or a `Promise` thereof).
   */
  public setClient(cb: ConfigBuilderCallback<IClient>) {
    this._set('client', cb);
  }

  /**
   * Creates an HTTP client by resolving the `apps` client from the HTTP module
   * or falling back to service discovery.
   *
   * @param clientId - Registered HTTP client identifier (typically `'apps'`).
   * @param init - Framework config-builder callback args providing module instances.
   * @returns An `IHttpClient` instance for widget API calls.
   */
  private async _createHttpClient(clientId: string, init: ConfigBuilderCallbackArgs) {
    const http = await init.requireInstance('http');

    if (http.hasClient(clientId)) {
      return http.createClient(clientId);
    } else {
      /** load service discovery module */
      const serviceDiscovery = await init.requireInstance('serviceDiscovery');
      return await serviceDiscovery.createClient(clientId);
    }
  }

  /**
   * Finalizes the configuration by creating the default HTTP client when no
   * custom client has been set.
   *
   * @param config - Partial configuration accumulated by builder callbacks.
   * @param _init - Framework config-builder callback args.
   * @returns The fully resolved {@link WidgetModuleConfig}.
   */
  protected async _processConfig(
    config: Partial<WidgetModuleConfig>,
    _init: ConfigBuilderCallbackArgs,
  ) {
    const httpClient = await this._createHttpClient('apps', _init);

    if (!config.client) {
      config.client = createDefaultClient(httpClient);
    }
    return config as WidgetModuleConfig;
  }
}
