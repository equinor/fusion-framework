/**
 * Error thrown when a required module fails to initialize within the expected
 * timeout window.
 *
 * Indicates a circular dependency or a module that never resolves.
 */
export class RequiredModuleTimeoutError extends Error {
  /**
   * Creates a new `RequiredModuleTimeoutError`.
   */
  constructor() {
    super('Module initialization timed out');
    this.name = 'RequiredModuleTimeoutError';
  }
}

export default RequiredModuleTimeoutError;
