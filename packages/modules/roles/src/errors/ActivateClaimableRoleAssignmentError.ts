import { RolesError } from './RolesError.js';

/**
 * Error thrown when a claimable role assignment cannot be activated, including cancellation.
 */
export class ActivateClaimableRoleAssignmentError extends RolesError {
  /**
   * Creates a claimable-role-assignment activation failure.
   *
   * @param message - Human-readable explanation of the failed activation.
   * @param options - Standard error options preserving an event or activation failure.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ActivateClaimableRoleAssignmentError';
  }
}
