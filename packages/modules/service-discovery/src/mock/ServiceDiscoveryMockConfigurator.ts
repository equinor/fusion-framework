import { ServiceDiscoveryConfigurator } from '../configurator';

import type { MockService } from './create-mock-service';
import { defaultServiceDiscoveryMockServices } from './default-service-discovery-mock-services';
import {
  ServiceDiscoveryMockClient,
  type ServiceDiscoveryMockClientOptions,
} from './ServiceDiscoveryMockClient';

/**
 * The real service discovery configurator, backed by an in-memory registry.
 *
 * @remarks
 * Nothing else changes: the same builder API, the same validation and the same
 * `ServiceDiscoveryProvider` are used. Only the boundary that would contact the
 * service registry is substituted.
 *
 * The registry is assembled here, on the builder, exactly like any other Fusion
 * configuration — and the client is constructed from the finished registry when
 * the module builds its config. A test therefore never constructs a client just
 * to add a service or point services at a local mock server.
 *
 * The registry starts from {@link defaultServiceDiscoveryMockServices}, so an
 * application boots without declaring anything.
 *
 * @example Serve every service from a local mock server, plus one extra service
 * ```typescript
 * enableServiceDiscoveryMock(configurator, (builder) => {
 *   builder.setBaseUri('http://localhost:6669');
 *   builder.addService({ key: 'my-api' });
 * });
 * ```
 *
 * @example Take full control of resolution
 * ```typescript
 * enableServiceDiscoveryMock(configurator, (builder) => {
 *   builder.setServiceDiscoveryClient(new MyOwnDiscoveryClient());
 * });
 * ```
 */
export class ServiceDiscoveryMockConfigurator extends ServiceDiscoveryConfigurator {
  #services = new Map<string, MockService>(
    // Index defaults by key so later registrations can replace one service deterministically.
    defaultServiceDiscoveryMockServices.map((service) => [service.key, service]),
  );
  #baseUri?: string;
  #resolveUnknownServices = true;

  /**
   * Creates a configurator with the supplied initial mock registry options.
   *
   * @param options - Initial registry and resolution options.
   */
  constructor(options: ServiceDiscoveryMockClientOptions = {}) {
    super();
    this.configure(options);
    // Deferred so that the client is built from the registry as it ends up, not as it starts
    this.setServiceDiscoveryClient(async () => this.createServiceDiscoveryClient());
  }

  /**
   * Applies a set of registry options.
   *
   * @remarks
   * Only the properties present are applied, so this composes with whatever was
   * configured before. `services` replaces the registry outright; use
   * {@link ServiceDiscoveryMockConfigurator.addServices | addServices} to keep
   * the baseline.
   *
   * @param options - Options to apply.
   * @returns The builder, for chaining.
   */
  public configure(options: ServiceDiscoveryMockClientOptions): this {
    // Apply each optional setting independently so omitted options preserve prior builder state.
    if (options.baseUri !== undefined) {
      this.setBaseUri(options.baseUri);
    }
    // Replace the registry only when the caller explicitly supplies services.
    if (options.services) {
      this.setServices(options.services);
    }
    // Keep the permissive default unless the caller explicitly changes it.
    if (options.resolveUnknownServices !== undefined) {
      this.setResolveUnknownServices(options.resolveUnknownServices);
    }
    return this;
  }

  /**
   * Points every service without an explicit `uri` at the given host.
   *
   * @remarks
   * This is how a locally running mock server — Mockoon, Prism, the Fusion dev
   * server — is addressed: the application performs real HTTP against a real
   * server, with nothing intercepting the requests.
   *
   * @param baseUri - Host to resolve services against, such as `http://localhost:6669`.
   * @returns The builder, for chaining.
   */
  public setBaseUri(baseUri: string | undefined): this {
    this.#baseUri = baseUri;
    return this;
  }

  /**
   * Returns the host services without an explicit `uri` resolve against.
   *
   * @returns The configured base URI, if one was set.
   */
  public getBaseUri(): string | undefined {
    return this.#baseUri;
  }

  /**
   * Registers a service, replacing any existing declaration with the same `key`.
   *
   * @param service - The service to register. Only `key` is required; `uri` and
   * `scopes` are derived from it when omitted.
   * @returns The builder, for chaining.
   *
   * @example
   * ```typescript
   * builder.addService({ key: 'my-api', uri: 'http://localhost:6669/my-api' });
   * ```
   */
  public addService(service: MockService): this {
    this.#services.set(service.key, service);
    return this;
  }

  /**
   * Registers several services, replacing existing declarations by `key`.
   *
   * @param services - The services to register.
   * @returns The builder, for chaining.
   */
  public addServices(services: Iterable<MockService>): this {
    // Register each item through addService so key replacement stays consistent.
    for (const service of services) {
      this.addService(service);
    }
    return this;
  }

  /**
   * Removes a registered service.
   *
   * @remarks
   * Use together with
   * {@link ServiceDiscoveryMockConfigurator.setResolveUnknownServices | setResolveUnknownServices(false)}
   * to assert that an application does not reach for a service.
   *
   * @param key - Key of the service to remove.
   * @returns The builder, for chaining.
   */
  public removeService(key: string): this {
    this.#services.delete(key);
    return this;
  }

  /**
   * Replaces the registry, dropping the baseline services.
   *
   * @param services - The complete set of services to serve.
   * @returns The builder, for chaining.
   */
  public setServices(services: Iterable<MockService>): this {
    this.#services.clear();
    return this.addServices(services);
  }

  /**
   * Returns the services currently registered.
   *
   * @returns A snapshot of the registered services.
   */
  public getServices(): MockService[] {
    return [...this.#services.values()];
  }

  /**
   * Controls whether unknown keys resolve or throw.
   *
   * @param resolveUnknownServices - `false` to throw for undeclared services,
   * which asserts that the application only uses services the test declared.
   * @returns The builder, for chaining.
   */
  public setResolveUnknownServices(resolveUnknownServices: boolean): this {
    this.#resolveUnknownServices = resolveUnknownServices;
    return this;
  }

  /**
   * Builds a client from the configured registry.
   *
   * @remarks
   * Called when the module assembles its configuration, which is why every
   * builder call — whenever it happened — is reflected in the client.
   *
   * @returns A client serving the configured registry.
   */
  protected createServiceDiscoveryClient(): ServiceDiscoveryMockClient {
    return new ServiceDiscoveryMockClient({
      services: this.getServices(),
      baseUri: this.#baseUri,
      resolveUnknownServices: this.#resolveUnknownServices,
    });
  }
}
