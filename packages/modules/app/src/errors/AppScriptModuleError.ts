import type { AppErrorType } from './app-error-type';

/**
 * Represents an error that occurs when loading the application script.
 */
export class AppScriptModuleError extends Error {
  /**
   * Creates a new instance of the AppScriptModuleError class.
   * @param type The type of the error.
   * @param message The error message.
   * @param options Additional options for the error.
   */
  constructor(
    public readonly type: AppErrorType,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
