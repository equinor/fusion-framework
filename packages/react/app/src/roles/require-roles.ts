import type { IRolesProvider } from '@equinor/fusion-framework-module-roles';
import {
  RequiredAccessRolesError,
  RolesError,
} from '@equinor/fusion-framework-module-roles/errors';
import { createMiddleware } from '../routing/create-middleware.js';

/** Options for the opt-in Roles middleware helper. */
export interface RequireRolesOptions {
  /** Require every listed role by default, or any one role with `any`. */
  mode?: 'all' | 'any';
}

/**
 * Minimal execution context needed by Roles middleware.
 *
 * This structural contract accepts Fusion router middleware arguments without
 * adding a router dependency to applications that only use the Roles hooks.
 */
interface RolesMiddlewareArgs {
  /** Initialized Fusion modules for the current application. */
  fusion: { modules: object };
  /** Cancellation signal for the current operation. */
  signal: AbortSignal;
}

/** Middleware that preserves the downstream result after confirming access. */
type RolesMiddleware = <TResult>(
  args: RolesMiddlewareArgs,
  next: () => TResult | Promise<TResult>,
) => Promise<TResult>;

/**
 * Recognizes the provider method without depending on the application's module types.
 * @param value - Provider found in the application's module collection.
 * @returns Whether the provider exposes the Roles access-check contract.
 */
const isAccessChecker = (value: unknown): value is Pick<IRolesProvider, 'hasAccessRole'> =>
  typeof value === 'object' &&
  value !== null &&
  'hasAccessRole' in value &&
  typeof value.hasAccessRole === 'function';

/**
 * Creates opt-in middleware requiring Roles V2 access roles before downstream work.
 *
 * Enable Roles in the application, then export this helper in a route module's
 * `middleware` array. The provider owns authorization and caching. Missing access
 * throws its existing `RequiredAccessRolesError`; service errors propagate unchanged.
 * The helper never continues a cancelled operation and adds no dependency to the router.
 *
 * @param roles - Exact, case-sensitive access-role names, trimmed and deduplicated.
 * @param options - Require all roles by default, or any one role with `mode: 'any'`.
 * @returns Middleware that preserves the result of the downstream chain.
 * @throws {TypeError} When role names or options are invalid.
 * @throws {RolesError} When the application has not enabled a usable Roles provider.
 * @throws {RequiredAccessRolesError} When the required access roles are not active.
 *
 * @example
 * ```ts
 * import { requireRoles } from '@equinor/fusion-framework-react-app/roles';
 *
 * export const middleware = [requireRoles(['Reports.Read'])];
 * ```
 */
export function requireRoles(
  roles: readonly string[],
  options?: RequireRolesOptions,
): RolesMiddleware {
  // Reject invalid declarations before a navigation or submission can start.
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new TypeError('requireRoles requires a nonempty array of access-role names.');
  }
  // Normalize every name so whitespace and duplicates cannot change the declared policy.
  const normalizedRoles = roles.map((role: unknown) => {
    // Invalid names are configuration errors, not optional requirements.
    if (typeof role !== 'string' || role.trim().length === 0) {
      throw new TypeError('requireRoles requires nonblank string access-role names.');
    }
    return role.trim();
  });
  const names = Object.freeze([...new Set(normalizedRoles)]);
  // Reject malformed options instead of silently changing the requested policy.
  if (
    options !== undefined &&
    (typeof options !== 'object' || options === null || Array.isArray(options))
  ) {
    throw new TypeError('requireRoles options must be an object.');
  }
  const mode = options?.mode === undefined ? 'all' : options.mode;
  // Unknown modes must not be interpreted as any-role access.
  if (mode !== 'all' && mode !== 'any') {
    throw new TypeError('requireRoles mode must be all or any.');
  }

  const middleware: RolesMiddleware = async ({ fusion, signal }, next) => {
    signal.throwIfAborted();
    const provider: unknown = Reflect.get(fusion.modules, 'roles');
    // Missing configuration must fail closed rather than skip authorization.
    if (!isAccessChecker(provider)) {
      throw new RolesError('Enable the Roles module before using requireRoles middleware.');
    }
    const granted = await provider.hasAccessRole(names, {
      required: mode === 'all',
      assert: true,
    });
    // Access checks can finish after the owning navigation or submission was cancelled.
    signal.throwIfAborted();
    // Remain fail-closed with providers that return false despite assert: true.
    if (granted !== true) {
      throw new RequiredAccessRolesError('The required access roles are not active.', names);
    }
    return next();
  };
  return createMiddleware(middleware);
}
