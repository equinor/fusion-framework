/**
 * Base error for failures produced by the Fusion Framework Roles module.
 *
 * Specialized Roles errors extend this class so consumers can handle every module failure through
 * {@link RolesError.is} without parsing messages.
 *
 * @example
 * ```ts
 * try {
 *   await framework.modules.roles.getActiveRoles();
 * } catch (error) {
 *   if (RolesError.is(error)) {
 *     reportRolesFailure(error.message);
 *   }
 * }
 * ```
 */
export class RolesError extends Error {
  /** Stable discriminator shared by Roles errors across runtime scopes. */
  public static readonly Type = 'RolesError' as const;

  /** Identifies this error as originating from the Roles module. */
  public readonly type = RolesError.Type;

  /**
   * Determines whether an unknown value is a Roles module error.
   *
   * @param error - Thrown value to inspect.
   * @returns True for `RolesError` and every specialized subclass.
   */
  public static is(error: unknown): error is RolesError {
    // Structural discrimination works when separate bundles contain distinct RolesError classes.
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    const candidate = error as Record<PropertyKey, unknown>;
    return (
      candidate.type === RolesError.Type &&
      typeof candidate.name === 'string' &&
      typeof candidate.message === 'string'
    );
  }

  /**
   * Creates a general Roles module error.
   *
   * @param message - Human-readable explanation of the failure.
   * @param options - Standard error options preserving the original cause.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'RolesError';
  }
}
