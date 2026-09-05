/**
 * Claimable assignment that can activate one required access role.
 */
export interface RequiredRoleClaim {
  readonly assignmentId: string;
  readonly name: string;
  readonly displayName: string;
  readonly description?: string;
}

/**
 * Roles V2 availability resolved for one access role required by an application.
 */
export interface RequiredRoleStatus {
  readonly name: string;
  readonly description?: string;
  readonly exists: boolean;
  readonly claims: readonly RequiredRoleClaim[];
}
