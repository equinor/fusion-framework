import { configureHttpClient } from '@equinor/fusion-framework-module-http';

import type { ModulesConfigurator, ModuleType } from '@equinor/fusion-framework-module';
import type {
  HttpClientOptions,
  HttpModule,
  IHttpClient,
} from '@equinor/fusion-framework-module-http';

import type { Service } from './types';
import { ServiceDiscoveryConfig } from './configurator';

export interface IServiceDiscoveryProvider {
  /**
   * Resolves a service by key
   * @param key - The key of the service to resolve
   */
  resolveService(key: string): Promise<Service>;

  /**
   * Fetch all services
   */
  resolveServices(): Promise<Service[]>;

  /**
   * create http client for a service
   * @param name key of the service
   * @param opt http client options
   *
   * @example
   * ```typescript
   * const myClient = await serviceDiscovery.createClient('my-service', {});
   * ```
   */
  createClient(
    name: string,
    opt?: Omit<HttpClientOptions, 'baseUri' | 'defaultScopes' | 'ctor'>,
  ): Promise<IHttpClient>;

  /**
   * Used in the framework to configure a http client which is resolved by service discovery
   *
   * @deprecating this method will be reworked in later versions, please don`t use!
   *
   * @param serviceName key of the service or an object with key and alias
   * @param config http client configurator
   *
   * @example
   * ```typescript
   * configure = (
   *   configurator: ModuleConfigBuilder<[HttpModule]>,
   *   ref: ModuleInstanceType<ServiceDiscovery>
   * )=> {
   *   ref.serviceDiscovery.configureClient(
   *     // use `my-service` from service discovery
   *     // and register it as `foo` in the http module
   *     { key: 'my-service', alias: 'foo'},
   *     configurator
   *   );
   * });
   *
   * ```
   */
  configureClient(
    serviceName: string | { key: string; alias: string },
    config: ModulesConfigurator<[HttpModule]>,
  ): Promise<void>;

  readonly config: ServiceDiscoveryConfig;
}

export class ServiceDiscoveryProvider implements IServiceDiscoveryProvider {
  constructor(
    public readonly config: ServiceDiscoveryConfig,
    protected readonly _http: ModuleType<HttpModule>,
  ) {}

  public resolveServices(): Promise<Service[]> {
    return this.config.discoveryClient.resolveServices();
  }

  public async resolveService(key: string): Promise<Service> {
    return this.config.discoveryClient.resolveService(key);
  }

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
