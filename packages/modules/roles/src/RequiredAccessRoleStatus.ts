/**
 * Currently activatable global assignment that can satisfy one required access role.
 */
export interface RequiredAccessRoleClaimableAssignment {
  readonly assignmentId: string;
  readonly name: string;
  readonly displayName: string;
  readonly description?: string;
}

/**
 * Roles V2 global access and current activation availability for one role required by an application.
 */
export interface RequiredAccessRoleStatus {
  readonly name: string;
  readonly description?: string;
  readonly exists: boolean;
  readonly claimableAssignments: readonly RequiredAccessRoleClaimableAssignment[];
}
