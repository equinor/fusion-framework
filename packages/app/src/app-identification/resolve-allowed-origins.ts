import { toOrigin } from './to-origin.js';
import type { ServiceRegistry } from './types.js';

/**
 * Rejects when `promise` has not settled within `ms`, clearing the timer either way.
 */
const withDeadline = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Service discovery did not respond within ${ms} ms`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });

/**
 * Resolves the origins that may receive app identification headers: the app's opted-in
 * origins, the portal origin, and every host listed in Fusion service discovery.
 *
 * Discovery failures and lookups slower than `timeoutMs` are logged and ignored, since
 * identification is diagnostic only and must never hold up app startup. Session-overridden
 * services are skipped because their URL may point at a host outside the Fusion CORS policy;
 * an app that wants those tagged must opt the origin in explicitly.
 *
 * @param allowedOrigins - Origins the app opted in.
 * @param registry - Service discovery used to list Fusion service hosts, when available.
 * @param timeoutMs - Maximum time to wait for service discovery. Defaults to 2000 ms.
 * @returns The set of allowed origins.
 */
export const resolveAllowedOrigins = async (
  allowedOrigins: Iterable<string>,
  registry?: ServiceRegistry,
  timeoutMs = 2000,
): Promise<Set<string>> => {
  const base = globalThis.location?.origin;
  const origins = new Set<string>(allowedOrigins);
  // Relative client URIs resolve to the portal origin, which always accepts Fusion headers
  if (base) {
    origins.add(base);
  }
  // Without a registry there are no Fusion service hosts to add
  if (!registry) {
    return origins;
  }
  try {
    const services = await withDeadline(registry.resolveServices(), timeoutMs);
    // Fusion services share a CORS policy that allows any header, so their hosts are safe targets
    for (const { uri, overridden } of services) {
      const origin = overridden ? undefined : toOrigin(uri, base);
      // Skip overridden URLs (not necessarily Fusion-hosted) and malformed registry entries
      if (origin) {
        origins.add(origin);
      }
    }
  } catch (error) {
    // Identification is diagnostic only; an unavailable or slow registry must not block app startup
    console.warn(
      'Unable to resolve Fusion services for app identification headers; only the portal origin and configured origins are tagged.',
      error,
    );
  }
  return origins;
};
