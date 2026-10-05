import type { Router } from './create-router.js';

/**
 * Layers two {@link Router}s: `primary` handles a request when one of its routes matches, and
 * `fallback` is tried only when none does.
 *
 * Used when a `serviceDiscovery: 'merge'` layer adds middleware to a service that already has
 * routes, so the merge layer can add or override individual routes without dropping every
 * route of the earlier layer. Routes registered on the composed router go to `primary`.
 *
 * Relies on routers reading the request body only after a route matches (as {@link createRouter}
 * does), so an unmatched `primary` leaves the body for `fallback`.
 *
 * @param primary - Higher-precedence router, e.g. a merge layer's middleware.
 * @param fallback - Lower-precedence router, e.g. the earlier layer's middleware.
 * @returns A router checking `primary` first, then `fallback`.
 *
 * @example
 * ```typescript
 * const router = composeRouters(mergeLayer.router, baseLayer.router);
 * await router.handle(req, res); // tries mergeLayer routes, then baseLayer routes
 * ```
 */
export function composeRouters(primary: Router, fallback: Router): Router {
  return {
    get: (path, handler) => primary.get(path, handler),
    post: (path, handler) => primary.post(path, handler),
    put: (path, handler) => primary.put(path, handler),
    patch: (path, handler) => primary.patch(path, handler),
    delete: (path, handler) => primary.delete(path, handler),
    options: (path, handler) => primary.options(path, handler),
    async handle(req, res, seed, serviceUrl, identity) {
      // The higher-precedence layer owns any route it registers, even one the fallback also has.
      if (await primary.handle(req, res, seed, serviceUrl, identity)) return true;
      return fallback.handle(req, res, seed, serviceUrl, identity);
    },
  };
}

export default composeRouters;
