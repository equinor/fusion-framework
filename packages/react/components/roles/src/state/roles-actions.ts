import { createAction, createAsyncAction, type ActionTypes } from '@equinor/fusion-observable';

import type {
  ActivateClaimableRoleAssignmentOperation,
  ActiveAccessRoleAssignments,
  ClaimableRoleAssignmentActivationResult,
  ClaimableRoleAssignmentDeactivationResult,
  ConsolidatedClaimableRoleAssignments,
  ConsolidatedRoleAssignments,
  DeactivateClaimableRoleAssignmentOperation,
} from './roles-state';

export const rolesActions = {
  loadActiveAccessRoleAssignments: createAsyncAction(
    'roles/activeAccessRoleAssignments/load',
    (operationId: number, refresh: boolean) => ({
      payload: undefined,
      meta: { operationId, refresh },
    }),
    (assignments: ActiveAccessRoleAssignments, operationId: number) => ({
      payload: assignments,
      meta: { operationId },
    }),
    (error: unknown, operationId: number) => ({ payload: error, meta: { operationId } }),
  ),
  loadConsolidatedClaimableRoleAssignments: createAsyncAction(
    'roles/consolidatedClaimableRoleAssignments/load',
    (operationId: number, refresh: boolean) => ({
      payload: undefined,
      meta: { operationId, refresh },
    }),
    (assignments: ConsolidatedClaimableRoleAssignments, operationId: number) => ({
      payload: assignments,
      meta: { operationId },
    }),
    (error: unknown, operationId: number) => ({ payload: error, meta: { operationId } }),
  ),
  loadConsolidatedRoleAssignments: createAsyncAction(
    'roles/consolidatedRoleAssignments/load',
    (operationId: number, refresh: boolean) => ({
      payload: undefined,
      meta: { operationId, refresh },
    }),
    (assignments: ConsolidatedRoleAssignments, operationId: number) => ({
      payload: assignments,
      meta: { operationId },
    }),
    (error: unknown, operationId: number) => ({ payload: error, meta: { operationId } }),
  ),
  activateClaimableRoleAssignment: createAsyncAction(
    'roles/claimableRoleAssignment/activate',
    (operation: ActivateClaimableRoleAssignmentOperation) => ({ payload: operation }),
    (result: ClaimableRoleAssignmentActivationResult, operationId: number) => ({
      payload: result,
      meta: { operationId },
    }),
    (error: unknown, operationId: number) => ({ payload: error, meta: { operationId } }),
  ),
  refreshAfterActivation: createAction(
    'roles/claimableRoleAssignment/activate/refresh',
    (activeAccessOperationId: number, claimableOperationId: number) => ({
      payload: { activeAccessOperationId, claimableOperationId },
    }),
  ),
  deactivateClaimableRoleAssignment: createAsyncAction(
    'roles/claimableRoleAssignment/deactivate',
    (operation: DeactivateClaimableRoleAssignmentOperation) => ({ payload: operation }),
    (result: ClaimableRoleAssignmentDeactivationResult, operationId: number) => ({
      payload: result,
      meta: { operationId },
    }),
    (error: unknown, operationId: number) => ({ payload: error, meta: { operationId } }),
  ),
  refreshAfterDeactivation: createAction(
    'roles/claimableRoleAssignment/deactivate/refresh',
    (activeAccessOperationId: number, claimableOperationId: number) => ({
      payload: { activeAccessOperationId, claimableOperationId },
    }),
  ),
};

export type RolesAction = ActionTypes<typeof rolesActions>;
