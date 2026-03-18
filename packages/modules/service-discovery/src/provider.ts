import { configureHttpClient } from '@equinor/fusion-framework-module-http';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import type { ModulesConfigurator, ModuleType } from '@equinor/fusion-framework-module';
import type {
  HttpClientOptions,
  HttpModule,
  IHttpClient,
} from '@equinor/fusion-framework-module-http';

import { version } from './version';

import type { Service } from './types';
import type { ServiceDiscoveryConfig } from './configurator';

/**
 * Public API surface of the Service Discovery provider.
 *
 * Consumers use this interface to resolve service endpoints, create
 * pre-configured HTTP clients for discovered services, or register
 * service-backed HTTP clients on a {@link ModulesConfigurator}.
 */
export interface IServiceDiscoveryProvider {
  /**
   * Resolves a single service endpoint by its lookup key.
   *
   * @param key - Unique service key (e.g. `"context"`, `"people"`).
   * @returns The resolved {@link Service} with URI and scopes.
   * @throws {Error} When no service matches the given key.
   */
  resolveService(key: string): Promise<Service>;

  /**
   * Fetches all registered services from the service discovery API.
   *
   * @returns An array of {@link Service} objects.
   */
  resolveServices(): Promise<Service[]>;

  /**
   * Creates an {@link IHttpClient} pre-configured with the base URI and
   * default OAuth scopes of the named service.
   *
   * @param name - Service key to resolve.
   * @param opt - Additional HTTP client options (headers, interceptors, etc.).
   *   `baseUri`, `defaultScopes`, and `ctor` are set automatically.
   * @returns A ready-to-use HTTP client bound to the resolved service.
   * @throws {Error} When the service cannot be resolved.
   *
   * @example
   * ```typescript
   * const client = await serviceDiscovery.createClient('my-api');
   * const data = await client.fetchAsync('/items');
   * ```
   */
  createClient(
    name: string,
    opt?: Omit<HttpClientOptions, 'baseUri' | 'defaultScopes' | 'ctor'>,
  ): Promise<IHttpClient>;

  /**
   * Registers a service-discovery-backed HTTP client on a configurator.
   *
   * Resolves the service by `key`, then calls
   * `configureHttpClient` with the resolved URI and scopes so that the
   * HTTP module can later create clients by name.
   *
   * @deprecated This method will be reworked in a future version.
   *   Prefer {@link createClient} for direct usage.
   *
   * @param serviceName - Service key, or an object `{ key, alias }` when
   *   the HTTP client should be registered under a different name.
   * @param config - The modules configurator to register the client on.
   *
   * @example
   * ```typescript
   * // Register 'my-service' as HTTP client 'foo'
   * await serviceDiscovery.configureClient(
   *   { key: 'my-service', alias: 'foo' },
   *   configurator,
   * );
   * ```
   */
  configureClient(
    serviceName: string | { key: string; alias: string },
    config: ModulesConfigurator<[HttpModule]>,
  ): Promise<void>;

  /** The resolved service discovery configuration. */
  readonly config: ServiceDiscoveryConfig;
}

/**
 * Default implementation of {@link IServiceDiscoveryProvider}.
 *
 * Created during module initialization and delegates service resolution to
 * the underlying {@link IServiceDiscoveryClient} while using the
 * {@link HttpModule} to construct pre-configured HTTP clients.
 */
export class ServiceDiscoveryProvider
  extends BaseModuleProvider<ServiceDiscoveryConfig>
  implements IServiceDiscoveryProvider
{
  /**
   * @param config - Resolved service discovery configuration.
   * @param _http - HTTP module instance used to create clients.
   */
  constructor(
    public readonly config: ServiceDiscoveryConfig,
    protected readonly _http: ModuleType<HttpModule>,
  ) {
    super({
      version,
      config,
    });
  }

  /** {@inheritDoc IServiceDiscoveryProvider.resolveServices} */
  public resolveServices(): Promise<Service[]> {
    return this.config.discoveryClient.resolveServices();
  }

  /** {@inheritDoc IServiceDiscoveryProvider.resolveService} */
  public async resolveService(key: string): Promise<Service> {
    return this.config.discoveryClient.resolveService(key);
  }

  /** {@inheritDoc IServiceDiscoveryProvider.createClient} */
  public async createClient(
    name: string,
    opt?: Omit<HttpClientOptions, 'baseUri' | 'defaultScopes' | 'ctor'>,
  ): Promise<IHttpClient> {
    const service = await this.resolveService(name);
    if (!service) {
      throw Error(`Could not load configuration of service [${name}]`);
    }
    return this._http.createClient({
      ...opt,
      baseUri: service.uri,
      defaultScopes: service.scopes,
    });
  }

  /** {@inheritDoc IServiceDiscoveryProvider.configureClient} */
  public async configureClient(
    serviceName: string | { key: string; alias: string },
    config: ModulesConfigurator<[HttpModule]>,
  ): Promise<void> {
    const { key, alias } =
      typeof serviceName === 'string' ? { key: serviceName, alias: serviceName } : serviceName;
    const { uri: baseUri, scopes: defaultScopes } = await this.resolveService(key);
    config.addConfig(configureHttpClient(alias, { baseUri, defaultScopes }));
  }
}
