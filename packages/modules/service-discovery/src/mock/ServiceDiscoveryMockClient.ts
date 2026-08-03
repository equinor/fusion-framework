import type { IServiceDiscoveryClient } from '../client';
import type { Service } from '../types';

import { createMockService, type MockService } from './create-mock-service';
import { defaultServiceDiscoveryMockServices } from './default-service-discovery-mock-services';

/**
 * The registry a mock service discovery client serves from.
 */
export interface ServiceDiscoveryMockClientOptions {
  /**
   * Services resolvable in the test.
   *
   * @remarks
   * Replaces {@link defaultServiceDiscoveryMockServices} outright. Omit to serve
   * the baseline. Composing a registry — starting from the baseline, adding or
   * removing individual services — is the configurator's job, so that there is a
   * single place where a registry is assembled.
   */
  services?: Iterable<MockService>;
  /**
   * Base URI used for services that do not declare their own `uri`.
   *
   * @remarks
   * This is the hook for running against a local mock server — Mockoon, Prism,
   * the Fusion dev server — without a service worker intercepting requests. With
   * `http://localhost:3000`, `apps` resolves to `http://localhost:3000/apps`, so
   * the application performs real HTTP against a real (local) server.
   */
  baseUri?: string;
  /**
   * Resolve any unknown key by synthesising a service, rather than throwing.
   *
   * @remarks
   * Defaults to `true` so a test does not fail merely because the application
   * resolved a service the test did not think to declare. Set to `false` to
   * assert that only declared services are used.
   */
  resolveUnknownServices?: boolean;
}

/**
 * An in-memory stand-in for the service discovery client.
 *
 * @remarks
 * Only the boundary that would contact the service registry is replaced. The
 * real `ServiceDiscoveryProvider` runs on top of it unchanged, so client
 * creation, scope resolution and HTTP client registration behave as they do in
 * production — the test exercises the framework rather than the mock.
 *
 * The client is immutable: it is constructed from a finished registry. Building
 * that registry belongs to
 * {@link ServiceDiscoveryMockConfigurator | the configurator}, which is why a
 * test rarely constructs this class directly.
 *
 * Both resolve methods are ordinary methods, so any test runner can spy on them
 * with its own tooling — no Fusion-specific mocking API to learn.
 *
 * @example Resolve every service from a locally running mock server
 * ```typescript
 * const client = new ServiceDiscoveryMockClient({ baseUri: 'http://localhost:3000' });
 * await client.resolveService('apps'); // uri: 'http://localhost:3000/apps'
 * ```
 *
 * @example Override a single call, from the test body
 * ```typescript
 * vi.spyOn(fusion.modules.serviceDiscovery.client, 'resolveService').mockResolvedValue(service);
 * ```
 */
export class ServiceDiscoveryMockClient implements IServiceDiscoveryClient {
  readonly #services: Map<string, Service>;
  readonly #baseUri?: string;
  readonly #resolveUnknown: boolean;

  /**
   * Creates an immutable client from the supplied mock registry options.
   *
   * @param options - Services and resolution behavior for the mock client.
   */
  public constructor(options: ServiceDiscoveryMockClientOptions = {}) {
    const {
      services = defaultServiceDiscoveryMockServices,
      baseUri,
      resolveUnknownServices = true,
    } = options;

    this.#baseUri = baseUri;
    this.#resolveUnknown = resolveUnknownServices;
    // Materialize the iterable once so every lookup uses the same immutable registry.
    this.#services = new Map(
      [...services].map((service) => [service.key, createMockService(service, baseUri)]),
    );
  }

  /**
   * Returns every registered service.
   *
   * @param _allow_cache - Ignored; the registry is already in memory.
   * @returns The resolved services.
   */
  public async resolveServices(_allow_cache?: boolean): Promise<Service[]> {
    return [...this.#services.values()];
  }

  /**
   * Resolves a single service by key.
   *
   * @param key - Service key, such as `apps`.
   * @param _allow_cache - Ignored; the registry is already in memory.
   * @returns The resolved service.
   * @throws When the key is unknown and unknown services are not allowed.
   */
  public async resolveService(key: string, _allow_cache?: boolean): Promise<Service> {
    const service = this.#services.get(key);
    // Return the registered object so explicitly configured service details are preserved.
    if (service) {
      return service;
    }

    // Synthesize undeclared services when the mock is configured to be permissive.
    if (this.#resolveUnknown) {
      return createMockService({ key }, this.#baseUri);
    }

    throw new Error(
      `Service "${key}" is not registered. Register it with addService({ key: '${key}' }), or allow unknown services.`,
    );
  }
}
