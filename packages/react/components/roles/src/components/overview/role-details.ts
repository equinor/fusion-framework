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

/** A claimable assignment whose identifier can be used for activation and deactivation. */
export interface ClaimableRoleDetails extends RoleDetails {
  readonly assignmentId: string;
  readonly validFrom?: string | null;
}

/** An active non-claimable assignment with a stable presentation key. */
export interface PermanentRoleDetails extends RoleDetails {
  readonly key: string;
}
