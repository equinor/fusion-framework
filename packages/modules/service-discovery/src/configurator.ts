import { from, lastValueFrom, map, type ObservableInput } from 'rxjs';

import {
  BaseConfigBuilder,
  type ConfigBuilderCallback,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';

import type { IHttpClient } from '@equinor/fusion-framework-module-http';

import { type IServiceDiscoveryClient, ServiceDiscoveryClient } from './client';

/**
 * Resolved configuration produced by {@link ServiceDiscoveryConfigurator}.
 *
 * Holds the fully-initialized {@link IServiceDiscoveryClient} that the
 * module provider uses at runtime to resolve service endpoints.
 */
export interface ServiceDiscoveryConfig {
  /** The client responsible for fetching and caching service endpoints. */
  discoveryClient: IServiceDiscoveryClient;
}

/**
 * Configuration builder for the Service Discovery module.
 *
 * Provides a fluent API to set up how service endpoints are resolved.
 * The simplest path is to call
 * {@link ServiceDiscoveryConfigurator.configureServiceDiscoveryClientByClientKey | configureServiceDiscoveryClientByClientKey}
 * with the HTTP client key that points to the service discovery backend.
 *
 * For full control, use
 * {@link ServiceDiscoveryConfigurator.setServiceDiscoveryClient | setServiceDiscoveryClient}
 * to supply a custom {@link IServiceDiscoveryClient} implementation.
 *
 * @example
 * ```typescript
 * enableServiceDiscovery(configurator, async (builder) => {
 *   builder.configureServiceDiscoveryClientByClientKey('sd_custom', '/services/v2');
 * });
 * ```
 */
export class ServiceDiscoveryConfigurator extends BaseConfigBuilder<ServiceDiscoveryConfig> {
  /**
   * Creates the final {@link ServiceDiscoveryConfig}.
   *
   * When no explicit discovery client has been registered, this method
   * auto-detects an HTTP client with key `"service_discovery"` and uses it
   * as the default transport.
   *
   * @param init - Builder callback arguments providing module accessors.
   * @param initial - Optional partial config inherited from a parent module.
   * @returns The fully resolved configuration.
   * @throws {Error} When the HTTP module is not registered.
   */
  protected async _createConfig(
    init: ConfigBuilderCallbackArgs,
    initial?: Partial<ServiceDiscoveryConfig> | undefined,
  ): Promise<ServiceDiscoveryConfig> {
    if (!init.hasModule('http')) {
      throw new Error('http module is required');
    }

    // if discoveryClient is not configured, check if http module has a client with key 'service_discovery'
    if (!this._has('discoveryClient')) {
      // check if http module has a client with key 'service_discovery'
      const httpProvider = await init.requireInstance('http');
      if (httpProvider.hasClient('service_discovery')) {
        this.configureServiceDiscoveryClientByClientKey('service_discovery');
      }
    }

    // convert parent to promise
    return lastValueFrom(from(super._createConfig(init, initial)));
  }

  /**
   * Validates and finalizes the service discovery configuration.
   *
   * @param config - Partial configuration assembled by the builder.
   * @param init - Builder callback arguments.
   * @returns An observable that emits the complete {@link ServiceDiscoveryConfig}.
   * @throws {Error} When `discoveryClient` has not been configured.
   */
  protected _processConfig(
    config: Partial<ServiceDiscoveryConfig>,
    init: ConfigBuilderCallbackArgs,
  ): ObservableInput<ServiceDiscoveryConfig> {
    if (!config.discoveryClient) {
      throw new Error('discoveryClient is required, please configure it');
    }
    return super._processConfig(config, init);
  }

  /**
   * Sets the service discovery client directly.
   *
   * Accepts either a ready-made {@link IServiceDiscoveryClient} instance or a
   * {@link ConfigBuilderCallback} that will be invoked during module
   * initialization to produce one.
   *
   * Use this method when you need full control over service resolution
   * (e.g. a mock client for testing or a static service list).
   *
   * @param discoveryClient - A client instance or an async factory function.
   *
   * @example
   * ```typescript
   * // Static / mock client
   * builder.setServiceDiscoveryClient({
   *   resolveServices: async () => [{ key: 'api', uri: 'https://localhost:5000', defaultScopes: [] }],
   *   resolveService: async (key) => ({ key, uri: 'https://localhost:5000', defaultScopes: [] }),
   * });
   * ```
   */
  setServiceDiscoveryClient(
    discoveryClient: IServiceDiscoveryClient | ConfigBuilderCallback<IServiceDiscoveryClient>,
  ): void {
    this._set(
      'discoveryClient',
      typeof discoveryClient === 'function' ? discoveryClient : async () => discoveryClient,
    );
  }

  /**
   * Configures a {@link ServiceDiscoveryClient} with a custom HTTP client and
   * optional endpoint path.
   *
   * This is the mid-level configuration path: you supply the transport
   * details and the module constructs a standard
   * {@link ServiceDiscoveryClient} with built-in caching, response parsing,
   * and `sessionStorage` override support.
   *
   * @param configCallback - Async factory that must return
   *   `{ httpClient, endpoint? }`. The `httpClient` is used to call the
   *   service discovery API at the given `endpoint` (defaults to `""`).
   * @throws {Error} When the factory does not return an `httpClient`.
   *
   * @example
   * ```typescript
   * builder.configureServiceDiscoveryClient(async ({ requireInstance }) => {
   *   const http = await requireInstance('http');
   *   return { httpClient: http.createClient('sd'), endpoint: '/services/v2' };
   * });
   * ```
   */
  configureServiceDiscoveryClient(
    configCallback: ConfigBuilderCallback<{ httpClient: IHttpClient; endpoint?: string }>,
  ): void {
    this.setServiceDiscoveryClient(async (args) => {
      const { httpClient, endpoint } = (await lastValueFrom(from(configCallback(args)))) ?? {};
      if (httpClient) {
        return new ServiceDiscoveryClient({
          http: httpClient,
          endpoint,
          postProcess: map((input) => {
            // Get a reference to sessionStorage from globalThis
            const storage =
              typeof globalThis !== 'undefined' ? globalThis.sessionStorage : undefined;

            // Check if sessionStorage is available before attempting to access it.
            // If sessionStorage is not available, return the input as is without attempting to apply any overrides.
            if (!storage) {
              return input;
            }

            // Check if there are any session overrides in session storage.
            try {
              const sessionOverrides: Record<string, { url: string; scopes: string[] }> =
                JSON.parse(storage.getItem('overriddenServiceDiscoveryUrls') || '{}');

              for (const [key, { url, scopes }] of Object.entries(sessionOverrides)) {
                const service = input.find((service) => service.key === key);

                // If the service can be found, override the values with the values
                // from session override.
                if (service) {
                  service.uri = url;
                  service.scopes = scopes;
                  service.overridden = true;
                }
              }
            } catch (e) {
              console.error(
                'Failed to JSON parse session overrides: "overriddenServiceDiscoveryUrls"',
                e,
              );
            }

            return input;
          }),
        });
      }
      throw Error('httpClient is required');
    });
  }

  /**
   * Configures service discovery using a named HTTP client key.
   *
   * This is the simplest configuration path. The HTTP module must already
   * have a client registered under `clientKey`. If `endpoint` is omitted
   * the client calls the root path of the HTTP client's base URI.
   *
   * @param clientKey - Key of the HTTP client to use for service discovery
   *   requests (must match an entry in the HTTP module configuration).
   * @param endpoint - Optional sub-path appended to the client's base URI
   *   when fetching the service list.
   *
   * @example
   * ```typescript
   * builder.configureServiceDiscoveryClientByClientKey(
   *   'service_discovery',
   *   '/custom/services',
   * );
   * ```
   */
  configureServiceDiscoveryClientByClientKey(clientKey: string, endpoint?: string): void {
    this.configureServiceDiscoveryClient(async ({ requireInstance }) => {
      const httpProvider = await requireInstance('http');
      const httpClient = httpProvider.createClient(clientKey);
      return {
        httpClient,
        endpoint,
      };
    });
  }
}
