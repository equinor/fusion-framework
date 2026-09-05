import { RolesError } from './RolesError.js';
import type { IRolesProvider } from '../RolesProvider.js';

/**
 * Error thrown when required Roles V2 access roles prevent module bootstrap.
 */
export class RequiredRolesError extends RolesError {
  /**
   * Determines whether an unknown value is a required-role bootstrap error.
   *
   * @param error - Thrown value to inspect, including values crossing application bundle boundaries.
   * @returns True when the value identifies missing required access roles.
   */
  public static is(error: unknown): error is RequiredRolesError {
    // Structural discrimination works when the host and application bundle separate class copies.
    if (!RolesError.is(error) || error.name !== 'RequiredRolesError') {
      return false;
    }
    const candidate = error as RequiredRolesError;
    // Validate every role before exposing the structurally narrowed collection to the host.
    return (
      Array.isArray(candidate.missingRoles) &&
      candidate.missingRoles.every((role) => typeof role === 'string')
    );
  }

  /**
   * Creates a required-role bootstrap error.
   *
   * @param message - Explanation of the failed role requirement.
   * @param missingRoles - Required access-role names that were not active.
   * @param provider - Initialized Roles provider that can inspect and recover the failed requirement.
   */
  constructor(
    message: string,
    public readonly missingRoles: readonly string[] = [],
    public readonly provider?: Pick<IRolesProvider, 'getRequiredRoleStatuses' | 'claimRole'>,
  ) {
    super(message);
    this.name = 'RequiredRolesError';
  }
}
