import type { ApiRoute } from './types';

/**
 * Represents an error that occurs when a route is deemed invalid.
 *
 * @extends {Error}
 * @param {string} message - A descriptive message explaining why the route is invalid.
 * @param {ErrorOptions} [options] - Optional additional error options.
 */
export class InvalidRouteError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvalidRouteError';
  }
}

/**
 * Validates an API route object to ensure it meets the required structure.
 *
 * @param route - The API route object to validate.
 * @throws {InvalidRouteError} If the route does not have a `match` property.
 * @throws {InvalidRouteError} If the route does not have either `middleware` or `proxy` defined.
 */
export function validateRoute(route: ApiRoute): void {
  if (!route.match) {
    throw new InvalidRouteError('Route matcher is required');
  }
  if (!route.middleware && !route.proxy) {
    throw new InvalidRouteError('Route must have middleware or proxy');
  }
}
