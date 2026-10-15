/**
 * Error thrown by {@link ServiceDiscoveryClient} while service discovery is in a
 * failure cooldown and no recent service list is available as a fallback.
 *
 * After a failed service discovery request the client pauses outgoing requests
 * for a growing backoff period instead of calling the API again immediately.
 * Calls made during that pause fail fast with this error, so a misbehaving caller
 * (retry loop, reload loop, render loop) cannot flood the service discovery API.
 *
 * @remarks
 * Use `cause` to inspect the original failure (for example an
 * `HttpJsonResponseError` with status `401`) and `retryAt` to decide when it is
 * worth trying again.
 *
 * @example
 * ```ts
 * try {
 *   await serviceDiscovery.resolveService('people');
 * } catch (error) {
 *   if (error instanceof ServiceDiscoveryUnavailableError) {
 *     console.warn(`service discovery paused until ${new Date(error.retryAt).toISOString()}`);
 *   }
 * }
 * ```
 */
export class ServiceDiscoveryUnavailableError extends Error {
  /** Epoch milliseconds when the client will attempt a new service discovery request. */
  public readonly retryAt: number;

  /** Number of consecutive failed service discovery requests in the current failure streak. */
  public readonly attempt: number;

  /**
   * @param args - Failure details for the current cooldown.
   * @param args.cause - The error from the last failed service discovery request.
   * @param args.retryAt - Epoch milliseconds when requests resume.
   * @param args.attempt - Number of consecutive failures in the current streak.
   */
  constructor(args: { cause: unknown; retryAt: number; attempt: number }) {
    const seconds = Math.max(0, Math.ceil((args.retryAt - Date.now()) / 1000));
    super(
      `Service discovery is unavailable after ${args.attempt} failed attempt(s); requests are paused for ${seconds}s`,
      { cause: args.cause },
    );
    this.name = 'ServiceDiscoveryUnavailableError';
    this.retryAt = args.retryAt;
    this.attempt = args.attempt;
  }
}
