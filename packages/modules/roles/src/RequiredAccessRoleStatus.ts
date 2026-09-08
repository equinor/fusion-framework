/**
 * Claimable assignment that can activate one required access role.
 */
export interface RequiredAccessRoleClaimableAssignment {
  readonly assignmentId: string;
  readonly name: string;
  readonly displayName: string;
  readonly description?: string;
}

/**
 * Roles V2 availability resolved for one access role required by an application.
 */
export interface RequiredAccessRoleStatus {
  readonly name: string;
  readonly description?: string;
  readonly exists: boolean;
  readonly claimableAssignments: readonly RequiredAccessRoleClaimableAssignment[];
}
