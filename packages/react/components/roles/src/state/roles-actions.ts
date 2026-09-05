import { createAction, createAsyncAction, type ActionTypes } from '@equinor/fusion-observable';

import type {
  ActiveRoles,
  ClaimableRoles,
  ClaimRoleOperation,
  DeactivateRoleOperation,
  RoleClaimResult,
  RoleDeactivateResult,
} from './roles-state';

export const rolesActions = {
  loadActive: createAsyncAction(
    'roles/active/load',
    (operationId: number, refresh: boolean) => ({
      payload: undefined,
      meta: { operationId, refresh },
    }),
    (roles: ActiveRoles, operationId: number) => ({ payload: roles, meta: { operationId } }),
    (error: unknown, operationId: number) => ({ payload: error, meta: { operationId } }),
  ),
  loadClaimable: createAsyncAction(
    'roles/claimable/load',
    (operationId: number, refresh: boolean) => ({
      payload: undefined,
      meta: { operationId, refresh },
    }),
    (roles: ClaimableRoles, operationId: number) => ({
      payload: roles,
      meta: { operationId },
    }),
    (error: unknown, operationId: number) => ({ payload: error, meta: { operationId } }),
  ),
  claimRole: createAsyncAction(
    'roles/claim',
    (operation: ClaimRoleOperation) => ({ payload: operation }),
    (result: RoleClaimResult, operationId: number) => ({
      payload: result,
      meta: { operationId },
    }),
    (error: unknown, operationId: number) => ({ payload: error, meta: { operationId } }),
  ),
  refreshAfterClaim: createAction(
    'roles/claim/refresh',
    (activeOperationId: number, claimableOperationId: number) => ({
      payload: { activeOperationId, claimableOperationId },
    }),
  ),
  deactivateRole: createAsyncAction(
    'roles/deactivate',
    (operation: DeactivateRoleOperation) => ({ payload: operation }),
    (result: RoleDeactivateResult, operationId: number) => ({
      payload: result,
      meta: { operationId },
    }),
    (error: unknown, operationId: number) => ({ payload: error, meta: { operationId } }),
  ),
  refreshAfterDeactivate: createAction(
    'roles/deactivate/refresh',
    (activeOperationId: number, claimableOperationId: number) => ({
      payload: { activeOperationId, claimableOperationId },
    }),
  ),
};

export type RolesAction = ActionTypes<typeof rolesActions>;
