/**
 * Error thrown when an API endpoint is called with a version string
 * that does not match any supported API version.
 *
 * @example
 * ```ts
 * throw new UnsupportedApiVersion('3.0');
 * // Error: unsupported version 3.0
 * ```
 */
export class UnsupportedApiVersion extends Error {
  /**
   * @param version - The unsupported version value that was requested.
   * @param cause - Optional underlying error or context.
   */
  constructor(
    public readonly version: string | number,
    cause?: unknown,
  ) {
    super(`unsupported version ${version}`, { cause });
  }
}
