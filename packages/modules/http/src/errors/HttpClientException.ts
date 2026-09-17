/**
 * Base error for failures produced by `@equinor/fusion-framework-module-http`'s HTTP client.
 *
 * Specialized client errors extend this class so consumers can handle every client failure
 * through {@link HttpClientException.is} without parsing messages.
 *
 * `instanceof` is enough when a caller catches its own `client.fetch(...)` call directly.
 * {@link HttpClientException.is} matters when the error crosses a bundle boundary before it's
 * caught — for example, a portal's global error boundary catching an unhandled error thrown by
 * one of the apps it hosts, where the app bundles its own copy of this module and `instanceof`
 * would fail because the two bundles reference distinct class objects.
 *
 * @example
 * Catching your own request directly — same bundle, so `instanceof` works fine:
 * ```ts
 * try {
 *   await client.fetch('/api/data');
 * } catch (error) {
 *   // same bundle: error is an instance of the exact HttpClientException class reference in scope
 *   if (error instanceof HttpClientException) {
 *     reportHttpClientFailure(error.message);
 *   }
 * }
 * ```
 *
 * @example
 * A portal's global error boundary catching an unhandled error from a hosted app that bundles
 * its own copy of this module — `instanceof` would fail here:
 * ```ts
 * function onUnhandledAppError(error: unknown) {
 *   // cross-bundle: the app's HttpClientException isn't the same class reference as the portal's
 *   if (HttpClientException.is(error)) {
 *     reportHttpClientFailure(error.message);
 *   }
 * }
 * ```
 */
export class HttpClientException extends Error {
  /** Stable discriminator shared by HTTP client errors across runtime/bundle scopes. */
  public static readonly Type = 'HttpClientException' as const;

  /** Identifies this error as originating from the HTTP client. */
  public readonly type = HttpClientException.Type;

  /**
   * Determines whether an unknown thrown value is an HTTP client error.
   *
   * @param error - Thrown value to inspect, including values crossing application bundle boundaries.
   * @returns True for `HttpClientException` and every specialized subclass.
   */
  public static is(error: unknown): error is HttpClientException {
    // Structural discrimination works when separate bundles contain distinct HttpClientException classes.
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    const candidate = error as Record<PropertyKey, unknown>;
    return (
      candidate.type === HttpClientException.Type &&
      typeof candidate.name === 'string' &&
      typeof candidate.message === 'string'
    );
  }

  /**
   * Creates a general HTTP client error.
   *
   * @param message - Human-readable explanation of the failure.
   * @param options - Standard error options preserving the original cause.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'HttpClientException';
  }
}

export default HttpClientException;
