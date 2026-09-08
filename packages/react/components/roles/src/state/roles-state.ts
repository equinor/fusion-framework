import type {
  ActivateClaimableRoleAssignmentInput,
  DeactivateClaimableRoleAssignmentInput,
  IRolesProvider,
} from '@equinor/fusion-framework-module-roles';

export type ActiveAccessRoleAssignments = Awaited<
  ReturnType<IRolesProvider['getActiveAccessRoleAssignments']>
>;
export type ConsolidatedClaimableRoleAssignments = Awaited<
  ReturnType<IRolesProvider['getConsolidatedClaimableRoleAssignments']>
>;
export type ConsolidatedRoleAssignments = Awaited<
  ReturnType<IRolesProvider['getConsolidatedRoleAssignments']>
>;
export type ClaimableRoleAssignmentActivationResult = Awaited<
  ReturnType<IRolesProvider['activateClaimableRoleAssignment']>
>;
export type ClaimableRoleAssignmentDeactivationResult = Awaited<
  ReturnType<IRolesProvider['deactivateClaimableRoleAssignment']>
>;

export type RoleAssignmentCollectionStatus = 'loading' | 'success' | 'error';

export interface RoleAssignmentCollectionState<TAssignments> {
  readonly assignments: TAssignments;
  readonly status: RoleAssignmentCollectionStatus;
  readonly error: unknown;
  readonly operationId: number;
}

export interface ClaimableRoleAssignmentMutationState {
  readonly pending: number;
  readonly error: unknown;
}

export interface RolesState {
  readonly activeAccessRoleAssignments: RoleAssignmentCollectionState<ActiveAccessRoleAssignments>;
  readonly consolidatedClaimableRoleAssignments: RoleAssignmentCollectionState<ConsolidatedClaimableRoleAssignments>;
  readonly consolidatedRoleAssignments: RoleAssignmentCollectionState<ConsolidatedRoleAssignments>;
  readonly activation: ClaimableRoleAssignmentMutationState;
  readonly deactivation: ClaimableRoleAssignmentMutationState;
}

export interface DeactivateClaimableRoleAssignmentOperation {
  readonly input: DeactivateClaimableRoleAssignmentInput;
  readonly operationId: number;
  readonly activeAccessOperationId: number;
  readonly claimableOperationId: number;
}

export interface ActivateClaimableRoleAssignmentOperation {
  readonly input: ActivateClaimableRoleAssignmentInput;
  readonly operationId: number;
  readonly activeAccessOperationId: number;
  readonly claimableOperationId: number;
}
