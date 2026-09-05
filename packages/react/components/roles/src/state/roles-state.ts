import type {
  ClaimRoleInput,
  DeactivateRoleInput,
  IRolesProvider,
} from '@equinor/fusion-framework-module-roles';

export type ActiveRoles = Awaited<ReturnType<IRolesProvider['getActiveRoles']>>;
export type ClaimableRoles = Awaited<ReturnType<IRolesProvider['getClaimableRoles']>>;
export type RoleClaimResult = Awaited<ReturnType<IRolesProvider['claimRole']>>;
export type RoleDeactivateResult = Awaited<ReturnType<IRolesProvider['deactivateRole']>>;

export type RolesCollectionStatus = 'loading' | 'success' | 'error';

export interface RolesCollectionState<TRoles> {
  readonly roles: TRoles;
  readonly status: RolesCollectionStatus;
  readonly error: unknown;
  readonly operationId: number;
}

export interface RoleClaimState {
  readonly pending: number;
  readonly error: unknown;
}

export interface RolesState {
  readonly active: RolesCollectionState<ActiveRoles>;
  readonly claimable: RolesCollectionState<ClaimableRoles>;
  readonly claim: RoleClaimState;
  readonly deactivate: RoleClaimState;
}

export interface DeactivateRoleOperation {
  readonly input: DeactivateRoleInput;
  readonly operationId: number;
  readonly activeOperationId: number;
  readonly claimableOperationId: number;
}

export interface ClaimRoleOperation {
  readonly input: ClaimRoleInput;
  readonly operationId: number;
  readonly activeOperationId: number;
  readonly claimableOperationId: number;
}
