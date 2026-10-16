import { normalizeRolesRequirement } from './normalize-roles-requirement.js';
import { routeMiddlewareMetadataKey } from './route-middleware-metadata-key.js';
import type { RouteMiddlewareMetadata } from './types.js';

/** Shared opaque entry; custom middleware never exposes any detail. */
const customMiddlewareMetadata: RouteMiddlewareMetadata = Object.freeze({ kind: 'custom' });

/**
 * Returns the inspectable metadata of one route middleware function.
 *
 * Middleware created by `requireRoles` reports `{ kind: 'roles', mode, roles }`. Every other
 * function reports `{ kind: 'custom' }`: its behaviour is opaque and must not be treated as a
 * published authorization requirement.
 *
 * This reads metadata from loaded middleware functions. Build tools that must not execute route
 * modules should instead recognise `requireRoles(...)` calls statically and normalize the literal
 * arguments with `normalizeRolesRequirement`.
 *
 * @param middleware - A middleware function as exported from a route module.
 * @returns Frozen route-local metadata for the middleware.
 * @throws {TypeError} When attached roles metadata is malformed, instead of hiding a requirement.
 *
 * @example
 * ```ts
 * import { requireRoles } from '@equinor/fusion-framework-react-router';
 * import { getRouteMiddlewareMetadata } from '@equinor/fusion-framework-react-router/middleware-metadata';
 *
 * getRouteMiddlewareMetadata(requireRoles(['Reports.Read']));
 * // { kind: 'roles', mode: 'all', roles: ['Reports.Read'] }
 * ```
 */
export const getRouteMiddlewareMetadata = (middleware: unknown): RouteMiddlewareMetadata => {
  // Non-functions cannot carry helper metadata; they stay opaque rather than failing inspection.
  if (typeof middleware !== 'function') {
    return customMiddlewareMetadata;
  }
  const metadata: unknown = Reflect.get(middleware, routeMiddlewareMetadataKey);
  // Absence of metadata is the normal case for app-defined middleware.
  if (metadata === undefined) {
    return customMiddlewareMetadata;
  }
  // Re-validate attached data so a tampered or foreign entry cannot publish a malformed requirement.
  if (
    typeof metadata === 'object' &&
    metadata !== null &&
    (metadata as { kind?: unknown }).kind === 'roles'
  ) {
    const { roles, mode } = metadata as { roles?: unknown; mode?: unknown };
    return normalizeRolesRequirement(roles, { mode });
  }
  throw new TypeError(
    'getRouteMiddlewareMetadata: middleware carries unrecognised metadata. Only requireRoles metadata is supported.',
  );
};

export default getRouteMiddlewareMetadata;
