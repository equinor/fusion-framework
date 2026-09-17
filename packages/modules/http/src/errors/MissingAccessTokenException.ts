import { HttpClientException } from './HttpClientException.js';

/**
 * Thrown when a scoped HTTP request cannot be sent because MSAL did not resolve an access token.
 *
 * The MSAL request handler fails closed rather than falling back to an anonymous request,
 * since a request that declares scopes has already signaled the target endpoint requires
 * authentication.
 *
 * `instanceof` is enough when a caller catches its own `client.fetch(...)` call directly. Use
 * {@link MissingAccessTokenException.is} instead when the error crosses a bundle boundary before
 * it's caught — for example, a portal's global error boundary catching an unhandled error thrown
 * by a hosted app that bundles its own copy of this module, where `instanceof` would fail because
 * the two bundles reference distinct class objects.
 *
 * @example
 * Catching your own request directly — same bundle, so `instanceof` works fine:
 * ```ts
 * try {
 *   await client.fetch('/api/data', { scopes: ['api.read'] });
 * } catch (error) {
 *   // same bundle: error is an instance of the exact MissingAccessTokenException class reference in scope
 *   if (error instanceof MissingAccessTokenException) {
 *     renderMissingTokenState();
 *   }
 * }
 * ```
 *
 * @example
 * A portal's global error boundary catching an unhandled error from a hosted app that bundles
 * its own copy of this module — `instanceof` would fail here:
 * ```ts
 * function onUnhandledAppError(error: unknown) {
 *   // cross-bundle: the app's exception isn't the same class reference as the portal's
 *   if (MissingAccessTokenException.is(error)) {
 *     renderMissingTokenState();
 *   }
 * }
 * ```
 */
export class MissingAccessTokenException extends HttpClientException {
  static Name = 'MissingAccessTokenException';

  /**
   * Determines whether an unknown thrown value is a {@link MissingAccessTokenException}.
   *
   * @param error - Thrown value to inspect, including values crossing application bundle boundaries.
   * @returns True when the value structurally matches this error, regardless of which module
   * instance constructed it.
   */
  public static is(error: unknown): error is MissingAccessTokenException {
    // Structural discrimination works when the host and application bundle separate class copies.
    return HttpClientException.is(error) && error.name === MissingAccessTokenException.Name;
  }

  /**
   * Creates a missing-access-token error.
   *
   * @param message - Human-readable explanation of which scoped request failed.
   * @param options - Standard error options preserving the original cause.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = MissingAccessTokenException.Name;
  }
}

export default MissingAccessTokenException;
