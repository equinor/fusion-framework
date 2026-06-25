/**
 * Custom error class for application configurator errors.
 *
 * Provides error context to help developers debug configuration and initialization issues.
 *
 * @example
 * ```ts
 * try {
 *   const modules = await initialize({ fusion, env });
 * } catch (error) {
 *   if (error instanceof AppConfiguratorError) {
 *     console.log(`Error in ${error.phase}: ${error.message}`);
 *   }
 * }
 * ```
 */
export class AppConfiguratorError extends Error {
  /**
   * @param message - Human-readable error description
   * @param phase - The phase where the error occurred
   * @param cause - The underlying error that caused this failure
   */
  constructor(
    message: string,
    public readonly phase: 'configuration' | 'initialization',
    cause?: unknown,
  ) {
    super(message);
    this.name = 'AppConfiguratorError';
    this.cause = cause;
  }
}

export default AppConfiguratorError;
