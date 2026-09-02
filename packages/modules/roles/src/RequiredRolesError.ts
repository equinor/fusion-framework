/**
 * Error thrown when required Roles V2 access roles prevent module bootstrap.
 */
export class RequiredRolesError extends Error {
  /**
   * Creates a required-role bootstrap error.
   *
   * @param message - Explanation of the failed role requirement.
   * @param missingRoles - Required access-role names that were not active.
   */
  constructor(
    message: string,
    public readonly missingRoles: readonly string[] = [],
  ) {
    super(message);
    this.name = 'RequiredRolesError';
  }
}
