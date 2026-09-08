/**
 * The claimable role assignment a user selected for activation in the audit dialog.
 *
 * @remarks
 * Structurally compatible with `RequiredAccessRoleClaimableAssignment` from the Roles module, so
 * both required-access recovery and ordinary role browsing can drive the same dialog.
 */
export interface ClaimableRoleAssignmentSelection {
  readonly assignmentId: string;
  readonly name: string;
  readonly displayName: string;
  readonly description?: string;
}

/** Normalized assignment metadata shared by role browsing and the information dialog. */
export interface RoleDetails {
  readonly displayName: string;
  readonly name: string;
  readonly description: string;
  readonly reasons: readonly string[];
  readonly validTo?: string | null;
  readonly scope?: {
    readonly isGlobal: boolean;
    readonly value: string | null;
    readonly scopeTypeIdentifier?: string | null;
  } | null;
  readonly activeTo?: string | null;
  readonly isActive: boolean;
}

/** A claimable role assignment whose identifier can be used for activation and deactivation. */
export interface ClaimableRoleDetails extends RoleDetails {
  readonly assignmentId: string;
  readonly validFrom?: string | null;
}

/** An effective access-role assignment with a stable presentation key. */
export interface ActiveAccessRoleDetails extends RoleDetails {
  readonly key: string;
}

/**
 * A consolidated, standing role assignment from `/consolidated-role-assignments`, with a stable
 * presentation key.
 *
 * @remarks
 * Roles V2 does not call these assignments permanent — they may still be validity-bounded.
 * Standing role assignments are read-only in the compact UI: unlike {@link ClaimableRoleDetails},
 * this shape carries no `assignmentId`, since a standing role assignment cannot be activated or
 * deactivated.
 */
export interface AssignedRoleDetails extends RoleDetails {
  readonly key: string;
  readonly validFrom?: string | null;
}
