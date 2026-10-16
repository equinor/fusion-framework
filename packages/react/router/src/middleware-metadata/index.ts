/**
 * React-free route middleware metadata for build consumers.
 *
 * Import from `@equinor/fusion-framework-react-router/middleware-metadata` to normalize and inspect
 * `requireRoles` declarations without loading React, React Router or page modules.
 *
 * @packageDocumentation
 */

export { getRouteMiddlewareMetadata } from './get-route-middleware-metadata.js';
export { normalizeRolesRequirement } from './normalize-roles-requirement.js';
export { requireRolesStaticContract } from './require-roles-static-contract.js';
export { routeMiddlewareMetadataKey } from './route-middleware-metadata-key.js';
export type {
  CustomMiddlewareMetadata,
  RequireRolesMode,
  RequireRolesOptions,
  RolesMiddlewareMetadata,
  RouteMiddlewareMetadata,
} from './types.js';
