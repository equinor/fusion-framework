/**
 * Error thrown when an {@link import('./types.js').ApiRoute} fails structural validation.
 *
 * Consumers can use `instanceof InvalidRouteError` to distinguish route
 * validation failures from other error types.
 */
export class InvalidRouteError extends Error {
  /**
   * Creates an {@link InvalidRouteError}.
   *
   * @param message - Human-readable description of the validation failure.
   * @param options - Optional `ErrorOptions` (e.g. `cause`) forwarded to `Error`.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvalidRouteError';
  }
}
