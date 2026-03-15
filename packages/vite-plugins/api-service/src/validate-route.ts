import type { ApiRoute } from './types.js';

/**
 * Error thrown when an {@link ApiRoute} fails structural validation.
 *
 * Consumers can use `instanceof InvalidRouteError` to distinguish route
 * validation failures from other error types.
 */
export class InvalidRouteError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvalidRouteError';
  }
}

/**
 * Validates that an {@link ApiRoute} has the minimum required structure:
 * a `match` pattern and at least one of `middleware` or `proxy`.
 *
 * @param route - The route definition to validate.
 * @throws {InvalidRouteError} When `route.match` is falsy.
 * @throws {InvalidRouteError} When neither `middleware` nor `proxy` is defined.
 */
export function validateRoute(route: ApiRoute): void {
  if (!route.match) {
    throw new InvalidRouteError('Route matcher is required');
  }
  if (!route.middleware && !route.proxy) {
    throw new InvalidRouteError('Route must have middleware or proxy');
  }
}
