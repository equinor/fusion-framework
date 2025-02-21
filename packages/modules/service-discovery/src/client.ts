import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import { Query } from '@equinor/fusion-query';

import type { Service } from './types';

import { firstValueFrom, from, lastValueFrom, map, type ObservableInput } from 'rxjs';
import { jsonSelector } from '@equinor/fusion-framework-module-http/selectors';
import { ApiServices } from './api-schema';

export interface IServiceDiscoveryClient {
  /**
   * Resolves a service by key
   * @param key - The key of the service to resolve
   */
  resolveService(key: string, allow_cache?: boolean): Promise<Service>;

  /**
   * Fetches services from the service discovery API.
   */
  resolveServices(allow_cache?: boolean): Promise<Service[]>;
}

export interface IServiceDiscoveryClientCtor {
  new (args: ServiceDiscoveryClientCtorArgs): ServiceDiscoveryClient;
}

type ServiceDiscoveryClientCtorArgs = {
  http: IHttpClient;
  endpoint?: string;
};

const queryKey = 'services';

/**
 * Transforms a Response object into an ObservableInput of Service arrays.
 *
 * @param response - The Response object to be transformed.
 * @returns An ObservableInput that emits an array of Service objects.
 */
const serviceResponseSelector = (response: Response): ObservableInput<Service[]> =>
  // parse response by using the jsonSelector
  from(jsonSelector(response)).pipe(
    // parse and validate the response
    map((value) => ApiServices.default([]).parse(value)),
  );

export class ServiceDiscoveryClient implements IServiceDiscoveryClient {
  #query: Query<Service[], void>;

  /** Endpoint for fetching services from API  */
  public readonly endpoint?: string;

  /** HTTP client for fetching services */
  public readonly http: IHttpClient;

  constructor({ http, endpoint }: ServiceDiscoveryClientCtorArgs) {
    this.http = http;
    this.endpoint = endpoint;

    // setup api handler (queue and cache)
    this.#query = new Query<Service[], void>({
      client: {
        fn: () => http.fetch$(endpoint ?? '', { selector: serviceResponseSelector }),
      },
      key: () => queryKey,
      // Cache for 5 minutes
      expire: 5 * 60 * 1000,
    });
  }

  public resolveServices(allow_cache?: boolean): Promise<Service[]> {
    const fn = allow_cache ? firstValueFrom : lastValueFrom;
    return fn(Query.extractQueryValue(this.#query.query()));
  }

  public async resolveService(key: string, allow_cache?: boolean): Promise<Service> {
    const services = await this.resolveServices(allow_cache);
    const service = services.find((s) => s.key === key);
    if (!service) {
      throw Error(`Failed to resolve service, invalid key [${key}]`);
    }
    return service;
  }
}
