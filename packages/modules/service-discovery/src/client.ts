import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import { Query } from '@equinor/fusion-query';

import type { Service } from './types.js';
import { ServiceDiscoveryUnavailableError } from './ServiceDiscoveryUnavailableError.js';

import {
  firstValueFrom,
  from,
  lastValueFrom,
  map,
  Subject,
  type MonoTypeOperatorFunction,
  type Observable,
  type ObservableInput,
} from 'rxjs';
import type {
  ServiceDiscoveryDiagnostic,
  ServiceDiscoveryResolveOrigin,
} from './ServiceDiscoveryDiagnostic.js';
import { jsonSelector } from '@equinor/fusion-framework-module-http/selectors';
import { ApiServices } from './api-services.js';

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

  /**
   * Optional stream of safe resolution outcomes used for operational telemetry.
   *
   * Emits one `resolve` outcome per {@link resolveServices} call, classified by where the
   * list came from, and one `unknown-service` notification per unmatched key. Contains no
   * keys, URIs, scopes or errors. Custom clients without it are not instrumented.
   */
  readonly diagnostic$?: Observable<ServiceDiscoveryDiagnostic>;
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

/** Pause after the first failed request; doubles per consecutive failure. */
const failureBackoffInitialMs = 1_000;

/** Upper bound for the pause between failed requests. */
const failureBackoffMaxMs = 30_000;

/** Maximum age of the last successful service list that may be returned when a refresh fails. */
const staleIfErrorMs = 24 * 60 * 60 * 1_000;

/** State of the current failure streak, cleared on the next successful request. */
type FailureState = {
  error: unknown;
  attempt: number;
  failedAt: number;
  retryAt: number;
};

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

  // Only apply a transform pipeline when the caller supplied one
  if (postProcess) {
    // Apply the caller-supplied operator (e.g. session overrides) before emitting
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
 *
 * Failures are hardened so a broken caller cannot flood the service discovery API:
 * - After a failed request the client pauses outgoing requests with exponential
 *   backoff (1s, 2s, 4s … capped at 30s). The pause resets on the first
 *   successful response.
 * - When a refresh fails, or a call arrives during the pause, the last successful
 *   service list is returned if it is younger than 24 hours.
 * - Without a usable fallback, the request that failed rethrows the original error,
 *   and calls made during the pause throw {@link ServiceDiscoveryUnavailableError}.
 */
export class ServiceDiscoveryClient implements IServiceDiscoveryClient {
  #query: Query<Service[], void>;

  #failure?: FailureState;
  #lastKnownGood?: { services: Service[]; receivedAt: number };
  #diagnostic = new Subject<ServiceDiscoveryDiagnostic>();

  /** {@inheritDoc IServiceDiscoveryClient.diagnostic$} */
  public readonly diagnostic$: Observable<ServiceDiscoveryDiagnostic> =
    this.#diagnostic.asObservable();

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
  public async resolveServices(allow_cache?: boolean): Promise<Service[]> {
    const started = performance.now();
    // Fail fast while cooling down so retry/reload/render loops never reach the network
    if (this.#failure && Date.now() < this.#failure.retryAt) {
      return this.#resolveFallback(
        new ServiceDiscoveryUnavailableError({
          cause: this.#failure.error,
          retryAt: this.#failure.retryAt,
          attempt: this.#failure.attempt,
        }),
        started,
        'cooldown',
      );
    }

    const startedAt = Date.now();
    let record: { status: string; value: Service[] };
    try {
      // firstValueFrom returns the cached snapshot; lastValueFrom waits for
      // the freshest value from the query
      const fn = allow_cache ? firstValueFrom : lastValueFrom;
      record = await fn(this.#query.query());
    } catch (error) {
      this.#registerFailure(error, startedAt);
      return this.#resolveFallback(error, started, 'network');
    }
    // Only a fresh response proves discovery works; a cached (possibly expired) snapshot must
    // not reset the failure streak or renew the age of the fallback list
    if (record.status === 'complete') {
      this.#failure = undefined;
      this.#lastKnownGood = { services: record.value, receivedAt: Date.now() };
    }
    this.#emit({
      type: 'resolve',
      outcome: 'success',
      origin: record.status === 'complete' ? 'network' : 'cache',
      duration: performance.now() - started,
    });
    return record.value;
  }

  /**
   * Records a failed request and schedules the next allowed request time.
   *
   * Concurrent callers share one in-flight request through {@link Query}, so they all
   * reject with the same failure; only the first one to settle may extend the streak,
   * otherwise a single failed request would be counted once per waiting caller.
   *
   * @param error - The error from the failed request.
   * @param startedAt - Epoch milliseconds when the caller started waiting for the request.
   */
  #registerFailure(error: unknown, startedAt: number): void {
    // A concurrent caller already recorded this same failed request
    if (this.#failure && this.#failure.failedAt >= startedAt) {
      return;
    }
    const attempt = (this.#failure?.attempt ?? 0) + 1;
    const delay = Math.min(failureBackoffMaxMs, failureBackoffInitialMs * 2 ** (attempt - 1));
    // Up to 20% jitter keeps many clients that failed together from retrying in lockstep
    const jittered = Math.round(delay * (0.8 + Math.random() * 0.2));
    const failedAt = Date.now();
    this.#failure = { error, attempt, failedAt, retryAt: failedAt + jittered };

    // Warn once per streak rather than once per call to keep consoles readable
    if (attempt === 1) {
      console.warn(
        `[service-discovery] request failed; pausing requests with backoff (max ${failureBackoffMaxMs}ms)`,
        error,
      );
    }
  }

  /**
   * Returns the last successful service list when it is still fresh enough,
   * otherwise rethrows the given error.
   *
   * @param error - Error to throw when no usable fallback exists.
   * @param started - `performance.now()` timestamp when resolution started.
   * @param failedOrigin - Classification reported when no fallback can be served.
   * @returns The last known good service list.
   * @throws The provided `error` when no service list younger than 24 hours exists.
   */
  #resolveFallback(
    error: unknown,
    started: number,
    failedOrigin: Extract<ServiceDiscoveryResolveOrigin, 'network' | 'cooldown'>,
  ): Service[] {
    const lastKnownGood = this.#lastKnownGood;
    // Prefer a recent service list over an error so callers have nothing to retry
    if (lastKnownGood && Date.now() - lastKnownGood.receivedAt <= staleIfErrorMs) {
      this.#emit({
        type: 'resolve',
        outcome: 'success',
        origin: 'fallback',
        duration: performance.now() - started,
      });
      return lastKnownGood.services;
    }
    this.#emit({
      type: 'resolve',
      outcome: 'failure',
      origin: failedOrigin,
      duration: performance.now() - started,
    });
    throw error;
  }

  /**
   * Publishes a safe diagnostic outcome without letting an observer affect resolution.
   * @param diagnostic - Classified outcome without keys, URIs, scopes or errors.
   */
  #emit(diagnostic: ServiceDiscoveryDiagnostic): void {
    try {
      this.#diagnostic.next(diagnostic);
    } catch {
      // Observers are diagnostic only; resolution results must stay unchanged.
    }
  }

  /** {@inheritDoc IServiceDiscoveryClient.resolveService} */
  public async resolveService(key: string, allow_cache?: boolean): Promise<Service> {
    const services = await this.resolveServices(allow_cache);
    // Locate the service matching the requested key
    const service = services.find((s) => s.key === key);
    // Fail loudly when the requested key doesn't resolve to a known service
    if (!service) {
      this.#emit({ type: 'unknown-service' });
      throw Error(`Failed to resolve service, invalid key [${key}]`);
    }
    return service;
  }
}
