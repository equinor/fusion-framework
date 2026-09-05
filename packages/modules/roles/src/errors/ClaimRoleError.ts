import { RolesError } from './RolesError.js';

/**
 * Error thrown when a role claim is canceled or cannot be completed.
 */
export class ClaimRoleError extends RolesError {
  /**
   * Creates a role-claim failure.
   *
   * @param message - Human-readable explanation of the failed role claim.
   * @param options - Standard error options preserving an event or activation failure.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ClaimRoleError';
  }
}
