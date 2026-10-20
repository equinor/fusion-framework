/**
 * Base error for failures produced by the HTTP module.
 *
 * The stable `type` discriminator supports guards across separately bundled class copies.
 * Native fetch and token-acquisition errors are not wrapped by this class.
 *
 * @example
 * ```ts
 * if (HttpException.is(error)) {
 *   console.error(error.message);
 * }
 * ```
 */
export class HttpException extends Error {
  /** Stable discriminator shared by HTTP module errors across bundles. */
  public static readonly Type = 'HttpException' as const;

  /** Identifies failures produced by the HTTP module. */
  public readonly type = HttpException.Type;

  /**
   * Identifies HTTP module errors without relying on shared prototypes.
   *
   * @param error - Unknown thrown value, possibly from another bundle.
   * @returns Whether the value has the HTTP discriminator and standard error fields.
   */
  public static is(error: unknown): error is HttpException {
    // Separate bundles cannot share an instanceof check.
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    const candidate = error as Record<PropertyKey, unknown>;
    return (
      candidate.type === HttpException.Type &&
      typeof candidate.name === 'string' &&
      typeof candidate.message === 'string' &&
      (candidate.stack === undefined || typeof candidate.stack === 'string')
    );
  }

  /**
   * Creates an HTTP module failure while preserving its original cause.
   *
   * @param message - Human-readable explanation of the failure.
   * @param options - Standard error options, including an optional cause.
   */
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'HttpException';
  }
}
