import { RolesError } from './RolesError.js';

/**
 * Error thrown when an activated claimable role assignment cannot be deactivated.
 */
export class DeactivateClaimableRoleAssignmentError extends RolesError {
  /**
   * Creates a claimable-role-assignment deactivation failure.
   *
   * @param message - Human-readable explanation of the failed deactivation.
   * @param options - Standard error options preserving the service failure.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DeactivateClaimableRoleAssignmentError';
  }
}
