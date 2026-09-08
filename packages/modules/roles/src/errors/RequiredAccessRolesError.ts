import { RolesError } from './RolesError.js';
import type { IRolesProvider } from '../RolesProvider.js';

/**
 * Error thrown when required Roles V2 access roles prevent module bootstrap.
 */
export class RequiredAccessRolesError extends RolesError {
  /**
   * Determines whether an unknown value is a required-access-role bootstrap error.
   *
   * @param error - Thrown value to inspect, including values crossing application bundle boundaries.
   * @returns True when the value identifies missing required access roles.
   */
  public static is(error: unknown): error is RequiredAccessRolesError {
    // Structural discrimination works when the host and application bundle separate class copies.
    if (!RolesError.is(error) || error.name !== 'RequiredAccessRolesError') {
      return false;
    }
    const candidate = error as RequiredAccessRolesError;
    // Validate every access-role name before exposing the structurally narrowed collection to the host.
    return (
      Array.isArray(candidate.missingAccessRoles) &&
      candidate.missingAccessRoles.every((role) => typeof role === 'string')
    );
  }

  /**
   * Creates a required-access-role bootstrap error.
   *
   * @param message - Explanation of the failed access-role requirement.
   * @param missingAccessRoles - Required access-role names that were not active.
   * @param provider - Initialized Roles provider that can inspect and recover the failed requirement.
   */
  constructor(
    message: string,
    public readonly missingAccessRoles: readonly string[] = [],
    public readonly provider?: Pick<
      IRolesProvider,
      'getRequiredAccessRoleStatuses' | 'activateClaimableRoleAssignment'
    >,
  ) {
    super(message);
    this.name = 'RequiredAccessRolesError';
  }
}
