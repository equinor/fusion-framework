/**
 * Error raised when a loaded dev-server configuration does not match its runtime schema.
 */
export class InvalidDevServerConfigError extends Error {
  /**
   * Checks whether an unknown value is an invalid dev-server configuration error.
   *
   * @param error - The value to inspect.
   * @returns `true` when the value carries this error's stable code.
   */
  static is(error: unknown): error is InvalidDevServerConfigError {
    return (
      error instanceof Error && 'code' in error && error.code === 'ERR_INVALID_DEV_SERVER_CONFIG'
    );
  }

  /** Stable identifier used to recognize this error across module boundaries. */
  readonly code = 'ERR_INVALID_DEV_SERVER_CONFIG';

  /**
   * Creates an actionable validation error with configuration paths.
   *
   * @param diagnostics - Human-readable path and validation messages.
   */
  constructor(diagnostics: string[]) {
    super(`Invalid dev-server configuration:\n- ${diagnostics.join('\n- ')}`);
    this.name = 'InvalidDevServerConfigError';
  }
}
