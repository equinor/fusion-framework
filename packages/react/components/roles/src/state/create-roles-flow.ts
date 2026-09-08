import { concat, defer, merge, of } from 'rxjs';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';

import type { Flow } from '@equinor/fusion-observable';
import type { IRolesProvider } from '@equinor/fusion-framework-module-roles';

import { rolesActions, type RolesAction } from './roles-actions';
import type { RolesState } from './roles-state';
import { refreshRoleAssignmentsAfterMutation } from './refresh-role-assignments-after-mutation';

/**
 * Keeps active access-role assignment failures inside their individual request.
 * @param provider - Provider supplying active access-role assignments.
 * @returns An independently settling collection flow.
 */
const loadActiveAccessRoleAssignmentsFlow =
  (provider: IRolesProvider): Flow<RolesAction, RolesState> =>
  (action$) => {
    // Every request completes independently while the reducer rejects stale results.
    return action$.pipe(
      filter(rolesActions.loadActiveAccessRoleAssignments.match),
      mergeMap((action) => {
        // Convert provider results into state transitions without terminating the action stream.
        return defer(() =>
          provider.getActiveAccessRoleAssignments({ refresh: action.meta.refresh }),
        ).pipe(
          map((assignments) =>
            rolesActions.loadActiveAccessRoleAssignments.success(
              assignments,
              action.meta.operationId,
            ),
          ),
          catchError((error: unknown) =>
            of(
              rolesActions.loadActiveAccessRoleAssignments.failure(error, action.meta.operationId),
            ),
          ),
        );
      }),
    );
  };

/**
 * Keeps consolidated claimable-role-assignment failures inside their individual request.
 * @param provider - Provider supplying consolidated claimable role assignments.
 * @returns An independently settling collection flow.
 */
const loadConsolidatedClaimableRoleAssignmentsFlow =
  (provider: IRolesProvider): Flow<RolesAction, RolesState> =>
  (action$) => {
    // Every request completes independently while the reducer rejects stale results.
    return action$.pipe(
      filter(rolesActions.loadConsolidatedClaimableRoleAssignments.match),
      mergeMap((action) => {
        // Convert provider results into state transitions without terminating the action stream.
        return defer(() =>
          provider.getConsolidatedClaimableRoleAssignments({ refresh: action.meta.refresh }),
        ).pipe(
          map((assignments) =>
            rolesActions.loadConsolidatedClaimableRoleAssignments.success(
              assignments,
              action.meta.operationId,
            ),
          ),
          catchError((error: unknown) =>
            of(
              rolesActions.loadConsolidatedClaimableRoleAssignments.failure(
                error,
                action.meta.operationId,
              ),
            ),
          ),
        );
      }),
    );
  };

/**
 * Keeps consolidated role-assignment failures inside their individual request.
 * @param provider - Provider supplying consolidated role assignments.
 * @returns An independently settling collection flow.
 */
const loadConsolidatedRoleAssignmentsFlow =
  (provider: IRolesProvider): Flow<RolesAction, RolesState> =>
  (action$) => {
    // Every request completes independently while the reducer rejects stale results.
    return action$.pipe(
      filter(rolesActions.loadConsolidatedRoleAssignments.match),
      mergeMap((action) => {
        // Convert provider results into state transitions without terminating the action stream.
        return defer(() =>
          provider.getConsolidatedRoleAssignments({ refresh: action.meta.refresh }),
        ).pipe(
          map((assignments) =>
            rolesActions.loadConsolidatedRoleAssignments.success(
              assignments,
              action.meta.operationId,
            ),
          ),
          catchError((error: unknown) =>
            of(
              rolesActions.loadConsolidatedRoleAssignments.failure(error, action.meta.operationId),
            ),
          ),
        );
      }),
    );
  };

/**
 * Settles each activation after its independent collection refreshes.
 * @param provider - Provider performing activation.
 * @returns A mutation flow that separates activation and collection failures.
 */
const activateClaimableRoleAssignmentFlow =
  (provider: IRolesProvider): Flow<RolesAction, RolesState> =>
  (action$) => {
    // Keep concurrent activations correlated by operation ID and complete each caller independently.
    return action$.pipe(
      filter(rolesActions.activateClaimableRoleAssignment.match),
      mergeMap((action) => {
        const { input, operationId, activeAccessOperationId, claimableOperationId } =
          action.payload;
        // Activation success starts one coordinated refresh of both assignment collections.
        return defer(() => provider.activateClaimableRoleAssignment(input)).pipe(
          mergeMap((result) => {
            // Refresh failures belong to collections, never to the committed activation.
            return concat(
              of(
                rolesActions.refreshAfterActivation(activeAccessOperationId, claimableOperationId),
              ),
              refreshRoleAssignmentsAfterMutation(
                provider,
                activeAccessOperationId,
                claimableOperationId,
              ),
              of(rolesActions.activateClaimableRoleAssignment.success(result, operationId)),
            );
          }),
          catchError((error: unknown) =>
            of(rolesActions.activateClaimableRoleAssignment.failure(error, operationId)),
          ),
        );
      }),
    );
  };

/**
 * Settles each deactivation after its independent collection refreshes.
 * @param provider - Provider performing deactivation.
 * @returns A mutation flow that separates deactivation and collection failures.
 */
const deactivateClaimableRoleAssignmentFlow =
  (provider: IRolesProvider): Flow<RolesAction, RolesState> =>
  (action$) => {
    // Keep concurrent deactivations correlated and refresh both collections after each mutation.
    return action$.pipe(
      filter(rolesActions.deactivateClaimableRoleAssignment.match),
      mergeMap((action) => {
        const { input, operationId, activeAccessOperationId, claimableOperationId } =
          action.payload;
        // Deactivation success starts one coordinated refresh of active access and claimable assignments.
        return defer(() => provider.deactivateClaimableRoleAssignment(input)).pipe(
          mergeMap((result) => {
            // Refresh failures belong to collections, never to the committed deactivation.
            return concat(
              of(
                rolesActions.refreshAfterDeactivation(
                  activeAccessOperationId,
                  claimableOperationId,
                ),
              ),
              refreshRoleAssignmentsAfterMutation(
                provider,
                activeAccessOperationId,
                claimableOperationId,
              ),
              of(rolesActions.deactivateClaimableRoleAssignment.success(result, operationId)),
            );
          }),
          catchError((error: unknown) =>
            of(rolesActions.deactivateClaimableRoleAssignment.failure(error, operationId)),
          ),
        );
      }),
    );
  };

/**
 * Creates the combined Roles V2 side-effect flow.
 *
 * @param provider - App-scoped Roles module provider used for API operations.
 * @returns A flow handling collection loads plus claimable-role-assignment activation and deactivation.
 */
export const createRolesFlow = (provider: IRolesProvider): Flow<RolesAction, RolesState> => {
  const activeAccessRoleAssignmentsFlow = loadActiveAccessRoleAssignmentsFlow(provider);
  const consolidatedClaimableRoleAssignmentsFlow =
    loadConsolidatedClaimableRoleAssignmentsFlow(provider);
  const consolidatedRoleAssignmentsFlow = loadConsolidatedRoleAssignmentsFlow(provider);
  const activationFlow = activateClaimableRoleAssignmentFlow(provider);
  const deactivationFlow = deactivateClaimableRoleAssignmentFlow(provider);
  return (action$, state$) =>
    merge(
      activeAccessRoleAssignmentsFlow(action$, state$),
      consolidatedClaimableRoleAssignmentsFlow(action$, state$),
      consolidatedRoleAssignmentsFlow(action$, state$),
      activationFlow(action$, state$),
      deactivationFlow(action$, state$),
    );
};
