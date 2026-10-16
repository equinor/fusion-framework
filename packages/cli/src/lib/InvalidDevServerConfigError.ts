/**
 * Error raised when a loaded dev-server configuration does not match its runtime schema.
 */
export class InvalidDevServerConfigError extends Error {
  readonly code = 'ERR_INVALID_DEV_SERVER_CONFIG';

  /**
   * Creates an actionable validation error with configuration paths.
   *
   * @param diagnostics - Human-readable path and validation messages.
   */
  constructor(diagnostics: string[]) {
    super(
      `Invalid dev-server configuration:\n${diagnostics.map((item) => `- ${item}`).join('\n')}`,
    );
    this.name = 'InvalidDevServerConfigError';
  }
}
