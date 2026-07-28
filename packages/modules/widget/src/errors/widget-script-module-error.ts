import type { WidgetErrorType } from '../errors.js';

/**
 * Error thrown when a widget script module cannot be dynamically imported.
 */
export class WidgetScriptModuleError extends Error {
  /**
   * @param type - Error category discriminator.
   * @param message - Human-readable error description.
   * @param options - Standard `ErrorOptions` (e.g., `cause`).
   */
  constructor(
    public readonly type: WidgetErrorType,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'WidgetScriptModuleError';
  }
}
