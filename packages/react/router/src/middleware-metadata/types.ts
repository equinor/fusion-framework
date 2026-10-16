/**
 * How a role requirement is satisfied.
 *
 * - `all` (default): every listed access role must be active.
 * - `any`: at least one listed access role must be active.
 */
export type RequireRolesMode = 'all' | 'any';

/**
 * Options accepted by `requireRoles`.
 */
export interface RequireRolesOptions {
  /** How the listed roles are combined. Defaults to `'all'`. */
  readonly mode?: RequireRolesMode;
}

/**
 * Inspectable declaration of a built-in required-role middleware.
 *
 * This is the route-local entry a build consumer (for example the route manifest producer)
 * publishes for a `requireRoles(...)` call. `roles` are exact, case-sensitive Roles V2
 * access-role names, trimmed and deduplicated in declaration order.
 */
export interface RolesMiddlewareMetadata {
  /** Discriminator for built-in role gates. */
  readonly kind: 'roles';
  /** How `roles` are combined. */
  readonly mode: RequireRolesMode;
  /** Normalized, non-empty list of access-role names. */
  readonly roles: readonly string[];
}

/**
 * Declaration of middleware whose behaviour cannot be inspected.
 *
 * Custom middleware functions are executable only. Consumers must not infer authorization
 * policy from them, so the presence of this entry means the published requirements of a
 * route are incomplete.
 */
export interface CustomMiddlewareMetadata {
  /** Discriminator for opaque, app-defined middleware. */
  readonly kind: 'custom';
}

/**
 * Route-local metadata entry for one middleware, in declaration order.
 */
export type RouteMiddlewareMetadata = RolesMiddlewareMetadata | CustomMiddlewareMetadata;
