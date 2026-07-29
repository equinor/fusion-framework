import type { ApiRoute } from './types.js';
import { InvalidRouteError } from './InvalidRouteError.js';

/**
 * Validates that an {@link ApiRoute} has the minimum required structure:
 * a `match` pattern and at least one of `middleware` or `proxy`.
 *
 * @param route - The route definition to validate.
 * @throws {InvalidRouteError} When `route.match` is falsy.
 * @throws {InvalidRouteError} When neither `middleware` nor `proxy` is defined.
 */
export function validateRoute(route: ApiRoute): void {
  // A route without a match pattern can never be selected for a request
  if (!route.match) {
    throw new InvalidRouteError('Route matcher is required');
  }
  // A route with neither middleware nor proxy has no way to handle a request
  if (!route.middleware && !route.proxy) {
    throw new InvalidRouteError('Route must have middleware or proxy');
  }
}
