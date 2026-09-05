import { RolesError } from './RolesError.js';

/**
 * Error thrown when an active claimable role cannot be deactivated.
 */
export class DeactivateRoleError extends RolesError {
  /**
   * Creates a role-deactivation failure.
   *
   * @param message - Human-readable explanation of the failed deactivation.
   * @param options - Standard error options preserving the service failure.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DeactivateRoleError';
  }
}
