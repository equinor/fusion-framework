import { toOrigin } from './to-origin.js';
import type { ServiceRegistry } from './types.js';

/**
 * Resolves the origins that may receive app identification headers: the app's opted-in
 * origins, the portal origin, and every host listed in Fusion service discovery.
 *
 * Discovery failures are logged and ignored, since identification is diagnostic only and
 * must never block app startup.
 *
 * @param allowedOrigins - Origins the app opted in.
 * @param registry - Service discovery used to list Fusion service hosts, when available.
 * @returns The set of allowed origins.
 */
export const resolveAllowedOrigins = async (
  allowedOrigins: Iterable<string>,
  registry?: ServiceRegistry,
): Promise<Set<string>> => {
  const base = globalThis.location?.origin;
  const origins = new Set<string>(allowedOrigins);
  // Relative client URIs resolve to the portal origin, which always accepts Fusion headers
  if (base) {
    origins.add(base);
  }
  try {
    const services = (await registry?.resolveServices()) ?? [];
    // Fusion services share a CORS policy that allows any header, so their hosts are safe targets
    for (const { uri } of services) {
      const origin = toOrigin(uri, base);
      // Skip malformed registry entries rather than failing app startup over diagnostics
      if (origin) {
        origins.add(origin);
      }
    }
  } catch (error) {
    // Identification is diagnostic only; an unavailable registry must not block app startup
    console.warn(
      'Unable to resolve Fusion services for app identification headers; only the portal origin and configured origins are tagged.',
      error,
    );
  }
  return origins;
};
