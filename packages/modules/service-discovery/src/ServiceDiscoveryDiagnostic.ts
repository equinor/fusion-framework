import type { OperationalOutcome } from '@equinor/fusion-framework-module-telemetry/schemas';

/**
 * Where a service list returned by service discovery came from.
 *
 * - `network`: a fresh response from the service discovery API (or the request that failed).
 * - `cache`: a cached snapshot returned without waiting for a refresh.
 * - `fallback`: the last known good list returned instead of a failure.
 * - `cooldown`: a call rejected during the failure backoff, without a network attempt.
 */
export type ServiceDiscoveryResolveOrigin = 'network' | 'cache' | 'fallback' | 'cooldown';

/**
 * Safe diagnostic outcome published by a service discovery client.
 *
 * It carries no service keys, URIs, scopes or original errors, so it can be mapped to
 * operational telemetry without further sanitizing. The underlying HTTP attempt is reported
 * separately by HTTP telemetry and is not repeated here.
 */
export type ServiceDiscoveryDiagnostic =
  | {
      type: 'resolve';
      outcome: Extract<OperationalOutcome, 'success' | 'failure'>;
      origin: ServiceDiscoveryResolveOrigin;
      /** Elapsed milliseconds for the resolution, including cache or fallback reads. */
      duration: number;
    }
  | { type: 'unknown-service' };
