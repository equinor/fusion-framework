import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import { Query } from '@equinor/fusion-query';

import type { Service } from './types';

import {
  firstValueFrom,
  from,
  lastValueFrom,
  map,
  type MonoTypeOperatorFunction,
  type ObservableInput,
} from 'rxjs';
import { jsonSelector } from '@equinor/fusion-framework-module-http/selectors';
import { ApiServices } from './api-schema';

/**
 * Contract for a client that resolves service endpoints from a service
 * discovery backend.
 *
 * Implementations must be able to fetch the full service list and look up
 * individual services by key. The default implementation is
 * {@link ServiceDiscoveryClient}.
 */
export interface IServiceDiscoveryClient {
  /**
   * Resolves a single service by its lookup key.
   *
   * @param key - Unique service identifier (e.g. `"context"`).
   * @param allow_cache - When `true`, the first cached value is returned
   *   immediately rather than waiting for a potential refresh.
   * @returns The resolved {@link Service}.
   * @throws {Error} When no service matches the given key.
   */
  resolveService(key: string, allow_cache?: boolean): Promise<Service>;

  /**
   * Fetches all registered services from the service discovery API.
   *
   * @param allow_cache - When `true`, returns the first cached snapshot;
   *   otherwise waits for the latest response.
   * @returns An array of {@link Service} objects.
   */
  resolveServices(allow_cache?: boolean): Promise<Service[]>;
}

/**
 * Constructor signature for classes that implement {@link IServiceDiscoveryClient}.
 */
export interface IServiceDiscoveryClientCtor {
  new (args: ServiceDiscoveryClientCtorArgs): ServiceDiscoveryClient;
}

/**
 * Options accepted by the {@link ServiceDiscoveryClient} constructor.
 */
type ServiceDiscoveryClientCtorArgs = {
  /** HTTP client used to call the service discovery API. */
  http: IHttpClient;
  /** Optional sub-path appended to the HTTP client's base URI. */
  endpoint?: string;
  /** Optional RxJS operator applied to the parsed service list before caching. */
  postProcess?: MonoTypeOperatorFunction<Service[]>;
};

/** Cache key used by the internal {@link Query} instance. */
const queryKey = 'services';

/**
 * Transforms a fetch {@link Response} into an observable that emits a
 * validated array of {@link Service} objects.
 *
 * The response body is parsed as JSON, validated against the
 * {@link ApiServices} Zod schema, and optionally piped through a
 * `postProcess` operator (used for session overrides).
 *
 * @param response - Raw fetch response from the service discovery API.
 * @param postProcess - Optional RxJS operator to transform the parsed list.
 * @returns An `ObservableInput` emitting the final `Service[]`.
 */
const serviceResponseSelector = (
  response: Response,
  postProcess?: MonoTypeOperatorFunction<Service[]>,
): ObservableInput<Service[]> => {
  // parse response by using the jsonSelector
  const result$ = from(jsonSelector(response)).pipe(
    // parse and validate the response
    map((value) => ApiServices.default([]).parse(value)),
  );

  if (postProcess) {
    return result$.pipe(postProcess);
  }

  return result$;
};

/**
 * Default service discovery client that fetches endpoints from a remote API,
 * validates the response with Zod, caches results via {@link Query}, and
 * supports `sessionStorage`-based overrides.
 *
 * @remarks
 * Results are cached for 5 minutes. When `allow_cache` is `true`,
 * {@link resolveServices} returns the first cached value immediately;
 * otherwise it waits for the latest API response.
 */
export class ServiceDiscoveryClient implements IServiceDiscoveryClient {
  #query: Query<Service[], void>;

  /** Sub-path appended to the HTTP client's base URI when fetching services. */
  public readonly endpoint?: string;

  /** HTTP client used to call the service discovery API. */
  public readonly http: IHttpClient;

  /**
   * @param options - Construction options including the HTTP client,
   *   optional endpoint path, and optional post-processing operator.
   */
  constructor(options: ServiceDiscoveryClientCtorArgs) {
    this.http = options.http;
    this.endpoint = options.endpoint;
    const postProcess = options.postProcess;

    // setup api handler (queue and cache)
    this.#query = new Query<Service[], void>({
      client: {
        fn: () =>
          this.http.fetch$(this.endpoint ?? '', {
            selector: (response) => serviceResponseSelector(response, postProcess),
          }),
      },
      key: () => queryKey,
      // Cache for 5 minutes
      expire: 5 * 60 * 1000,
    });
  }

  /** {@inheritDoc IServiceDiscoveryClient.resolveServices} */
  public resolveServices(allow_cache?: boolean): Promise<Service[]> {
    // firstValueFrom returns the cached snapshot; lastValueFrom waits for
    // the freshest value from the query
    const fn = allow_cache ? firstValueFrom : lastValueFrom;
    return fn(Query.extractQueryValue(this.#query.query()));
  }

  /** {@inheritDoc IServiceDiscoveryClient.resolveService} */
  public async resolveService(key: string, allow_cache?: boolean): Promise<Service> {
    const services = await this.resolveServices(allow_cache);
    const service = services.find((s) => s.key === key);
    if (!service) {
      throw Error(`Failed to resolve service, invalid key [${key}]`);
    }
    return service;
  }
}
