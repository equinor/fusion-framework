import { configureHttpClient } from '@equinor/fusion-framework-module-http';

import type { ModulesConfigurator, ModuleType } from '@equinor/fusion-framework-module';
import type {
  HttpClientOptions,
  HttpModule,
  IHttpClient,
} from '@equinor/fusion-framework-module-http';

import type { Service } from './types';
import type { ServiceDiscoveryConfig } from './configurator';
import { TelemetryLevel } from '@equinor/fusion-framework-module-telemetry';
import { tr } from 'zod/v4/locales';

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

  public async resolveServices(): Promise<Service[]> {
    const { telemetry, discoveryClient } = this.config;
    const measure = telemetry?.measure({
      name: 'service-discovery.resolveServices',
      level: TelemetryLevel.Debug,
    });
    try {
      const services = await discoveryClient.resolveServices();
      measure?.measure();
      return services;
    } catch (exception) {
      measure?.measure({ properties: { error: String(exception) } });
      if (exception instanceof Error) {
        telemetry?.trackException({
          name: 'service-discovery.resolveServices.error',
          exception,
        });
      }
      throw exception;
    }
  }

  public async resolveService(key: string): Promise<Service> {
    const { telemetry, discoveryClient } = this.config;
    const measure = telemetry?.measure({
      name: 'service-discovery.resolveServices',
      level: TelemetryLevel.Debug,
      properties: { key },
    });
    try {
      const service = await discoveryClient.resolveService(key);
      measure?.measure();
      return service;
    } catch (exception) {
      measure?.measure({ properties: { error: String(exception) } });
      if (exception instanceof Error) {
        telemetry?.trackException({
          name: 'service-discovery.resolveService.error',
          exception,
          properties: { key },
        });
      }
      throw exception;
    }
  }

  public async createClient(
    name: string,
    opt?: Omit<HttpClientOptions, 'baseUri' | 'defaultScopes' | 'ctor'>,
  ): Promise<IHttpClient> {
    const { telemetry } = this.config;
    const service = await this.resolveService(name);
    if (!service) {
      const error = Error(`Could not load configuration of service [${name}]`);
      error.name = 'ServiceDiscoveryError';
      telemetry?.trackException({ name: 'service-discovery.createClient.error', exception: error });
      throw error;
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
