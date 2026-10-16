import type { IRolesProvider } from '@equinor/fusion-framework-module-roles';
import { RequiredAccessRolesError } from '@equinor/fusion-framework-module-roles/errors';

import type { MiddlewareFunction } from './middleware.js';
import { normalizeRolesRequirement } from './middleware-metadata/normalize-roles-requirement.js';
import { routeMiddlewareMetadataKey } from './middleware-metadata/route-middleware-metadata-key.js';
import type { RequireRolesOptions } from './middleware-metadata/types.js';
import { RequireRolesError } from './RequireRolesError.js';

/** The provider methods the guard relies on; anything else is not a usable Roles module. */
type RolesAccessChecker = Pick<IRolesProvider, 'hasAccessRole'>;

/**
 * Reads the Roles provider from the Fusion modules without assuming the app enabled it.
 *
 * @param modules - Fusion modules instance from the router context.
 * @returns The Roles provider, or `undefined` when the Roles module is not configured.
 */
const readRolesProvider = (modules: object): RolesAccessChecker | undefined => {
  const roles: unknown = Reflect.get(modules, 'roles');
  // Only an object exposing the provider check counts; a partial value is a configuration error.
  if (
    typeof roles === 'object' &&
    roles !== null &&
    typeof (roles as Partial<RolesAccessChecker>).hasAccessRole === 'function'
  ) {
    return roles as RolesAccessChecker;
  }
  return undefined;
};

/**
 * Creates route middleware that requires Fusion Roles V2 access roles before the route's
 * loaders, actions and components run.
 *
 * Export it in the route module's `middleware` array. The check runs on every middleware
 * execution: initial and later navigations, revalidations, fetcher loads and submissions,
 * including routes that only render a component. Nested requirements compose with AND because
 * every matched route's middleware must pass; a child route cannot weaken a parent requirement.
 *
 * The decision is delegated to the Roles provider's `hasAccessRole` (exact, case-sensitive,
 * global assignments only), using the provider's normal caching. Outcomes:
 *
 * - granted: the chain continues;
 * - not granted: throws {@link RequireRolesError} with reason `denied`, keeping the provider's
 *   `RequiredAccessRolesError` as `cause` for access-recovery UI;
 * - provider failure: throws reason `check-failed` (never treated as granted or denied);
 * - Roles module missing: throws reason `not-configured`.
 *
 * The middleware carries inspectable metadata `{ kind: 'roles', mode, roles }`, readable with
 * `getRouteMiddlewareMetadata`. Do not repeat it in `handle`.
 *
 * Client checks protect the UI only; backend APIs must still authorize every request.
 *
 * @param roles - Exact Roles V2 access-role names. Trimmed and deduplicated; must not be empty or
 *   contain blank names.
 * @param options - `{ mode: 'any' }` to require at least one role. Defaults to `{ mode: 'all' }`.
 * @returns Route middleware enforcing the requirement.
 * @throws {TypeError} Immediately, when `roles` or `options` are invalid.
 *
 * @example
 * ```ts
 * // src/pages/ReportsPage.tsx
 * import { requireRoles } from '@equinor/fusion-framework-react-router';
 *
 * export const middleware = [requireRoles(['Reports.Read'])];
 * ```
 *
 * @example
 * ```ts
 * export const middleware = [requireRoles(['Reports.Read', 'Reports.Admin'], { mode: 'any' })];
 * ```
 */
export const requireRoles = (
  roles: readonly string[],
  options?: RequireRolesOptions,
): MiddlewareFunction => {
  // Validate at declaration so invalid requirements fail when the route module loads.
  const requirement = normalizeRolesRequirement(roles, options);

  const middleware: MiddlewareFunction = async ({ fusion, signal }, next) => {
    const provider = readRolesProvider(fusion.modules);
    // A missing Roles module must surface as a configuration error, never as granted or denied.
    if (!provider) {
      throw new RequireRolesError('not-configured', requirement);
    }

    let granted: boolean;
    try {
      // `assert` makes the provider report the missing roles and itself for recovery UI.
      granted = await provider.hasAccessRole(requirement.roles, {
        required: requirement.mode === 'all',
        assert: true,
      });
    } catch (error) {
      // A cancelled operation is discarded by the router; do not report it as an access outcome.
      signal.throwIfAborted();
      // Only the provider's assertion error is a denial; every other failure leaves access unknown.
      if (RequiredAccessRolesError.is(error)) {
        throw new RequireRolesError('denied', requirement, error.missingAccessRoles, {
          cause: error,
        });
      }
      throw new RequireRolesError('check-failed', requirement, [], { cause: error });
    }
    // The check may outlive the operation; never continue a cancelled chain.
    signal.throwIfAborted();
    // Asserting providers throw on failure; a plain `false` is still a denial, never a pass.
    if (granted !== true) {
      throw new RequireRolesError('denied', requirement, requirement.roles);
    }
    return next();
  };

  // Non-enumerable and read-only so metadata cannot be altered after the requirement is declared.
  Object.defineProperty(middleware, routeMiddlewareMetadataKey, {
    value: requirement,
    enumerable: false,
    writable: false,
    configurable: false,
  });
  return middleware;
};

export default requireRoles;
