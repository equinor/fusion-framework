import { configureHttpClient } from '@equinor/fusion-framework-module-http';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import {
  TelemetryLevel,
  type ITelemetryProvider,
  type TelemetryConnectable,
} from '@equinor/fusion-framework-module-telemetry';
import type { Subscription } from 'rxjs';

import type { ModulesConfigurator, ModuleType } from '@equinor/fusion-framework-module';
import type {
  HttpClientOptions,
  HttpModule,
  IHttpClient,
} from '@equinor/fusion-framework-module-http';

import { version } from './version.js';

import type { Service } from './types.js';
import type { ServiceDiscoveryConfig } from './configurator.js';
import type { IServiceDiscoveryClient } from './client.js';
import type { ServiceDiscoveryDiagnostic } from './ServiceDiscoveryDiagnostic.js';
import { createOperationalTelemetry } from '@equinor/fusion-framework-module-telemetry/utils';

/**
 * Public API surface of the Service Discovery provider.
 *
 * Consumers use this interface to resolve service endpoints, create
 * pre-configured HTTP clients for discovered services, or register
 * service-backed HTTP clients on a {@link ModulesConfigurator}.
 */
export interface IServiceDiscoveryProvider extends TelemetryConnectable {
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

  /**
   * The client this provider resolves services through.
   *
   * @remarks
   * Mirrors `MsalProvider.client`. Exposed so a test can spy on resolution with
   * its own test runner without reaching into {@link IServiceDiscoveryProvider.config | config}.
   */
  readonly client: IServiceDiscoveryClient;
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
    this._addTeardown(() => {
      this.#diagnostics?.unsubscribe();
      this.#telemetry.disconnect();
    });
  }

  #telemetry = createOperationalTelemetry('service-discovery');
  #diagnostics?: Subscription;

  /**
   * Connects optional operational telemetry for the client this provider owns.
   *
   * Records one `fusion.service-discovery.resolve.duration` per network, fallback or cooldown
   * resolution, plus `fallback`, `cooldown` and `unknown-service` notifications. Cached
   * resolutions record only a Debug-level `cache-hit` notification, so hosts filtering at
   * Information or above export nothing for them. No keys,
   * URIs, scopes or errors are recorded, and HTTP attempts are left to HTTP telemetry.
   * Calling it again replaces the provider; `undefined` records nothing until reconnected.
   *
   * @param telemetry - Host telemetry provider, or `undefined` to record nothing.
   */
  public connectTelemetry(telemetry: ITelemetryProvider | undefined): void {
    this.#telemetry.connect(telemetry);
    const diagnostic$ = this.client.diagnostic$;
    // One subscription serves every connection; custom clients without a stream are skipped.
    if (this.#diagnostics || !this.#telemetry.connected || !diagnostic$) {
      return;
    }
    const report = this.#telemetry.report;
    this.#diagnostics = diagnostic$.subscribe((diagnostic: ServiceDiscoveryDiagnostic) => {
      // An unmatched key is a notification only; it has no measured resolution of its own.
      if (diagnostic.type === 'unknown-service') {
        report({
          notification: true,
          operation: 'unknown-service',
          outcome: 'failure',
          level: TelemetryLevel.Warning,
        });
        return;
      }
      const { outcome, origin, duration } = diagnostic;
      // Cache hits dominate lookup volume and carry no diagnostic value at default levels,
      // so they are a single Debug notification rather than a measured resolution.
      if (origin === 'cache') {
        report({
          notification: true,
          operation: 'cache-hit',
          outcome,
          level: TelemetryLevel.Debug,
        });
        return;
      }
      report({ operation: 'resolve', outcome, duration });
      // Network resolutions are fully described by the measurement and the HTTP attempt.
      if (origin !== 'network') {
        report({
          notification: true,
          operation: origin,
          outcome,
          level: TelemetryLevel.Warning,
        });
      }
    });
  }

  /** {@inheritDoc IServiceDiscoveryProvider.client} */
  public get client(): IServiceDiscoveryClient {
    return this.config.discoveryClient;
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
    // A missing service configuration means the http client can't be constructed
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
