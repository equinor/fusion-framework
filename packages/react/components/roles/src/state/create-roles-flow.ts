import { concat, defer, merge, of } from 'rxjs';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';

import type { Flow } from '@equinor/fusion-observable';
import type { IRolesProvider } from '@equinor/fusion-framework-module-roles';

import { rolesActions, type RolesAction } from './roles-actions';
import type { RolesState } from './roles-state';
import { refreshRolesAfterMutation } from './refresh-roles-after-mutation';

/**
 * Keeps active-role failures inside their individual request.
 * @param provider - Provider supplying active roles.
 * @returns An independently settling collection flow.
 */
const loadActiveRolesFlow =
  (provider: IRolesProvider): Flow<RolesAction, RolesState> =>
  (action$) => {
    // Every request completes independently while the reducer rejects stale results.
    return action$.pipe(
      filter(rolesActions.loadActive.match),
      mergeMap((action) => {
        // Convert provider results into state transitions without terminating the action stream.
        return defer(() => provider.getActiveRoles({ refresh: action.meta.refresh })).pipe(
          map((roles) => rolesActions.loadActive.success(roles, action.meta.operationId)),
          catchError((error: unknown) =>
            of(rolesActions.loadActive.failure(error, action.meta.operationId)),
          ),
        );
      }),
    );
  };

/**
 * Keeps claimable-role failures inside their individual request.
 * @param provider - Provider supplying claimable roles.
 * @returns An independently settling collection flow.
 */
const loadClaimableRolesFlow =
  (provider: IRolesProvider): Flow<RolesAction, RolesState> =>
  (action$) => {
    // Every request completes independently while the reducer rejects stale results.
    return action$.pipe(
      filter(rolesActions.loadClaimable.match),
      mergeMap((action) => {
        // Convert provider results into state transitions without terminating the action stream.
        return defer(() => provider.getClaimableRoles({ refresh: action.meta.refresh })).pipe(
          map((roles) => rolesActions.loadClaimable.success(roles, action.meta.operationId)),
          catchError((error: unknown) =>
            of(rolesActions.loadClaimable.failure(error, action.meta.operationId)),
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
const claimRoleFlow =
  (provider: IRolesProvider): Flow<RolesAction, RolesState> =>
  (action$) => {
    // Keep concurrent claims correlated by operation ID and complete each caller independently.
    return action$.pipe(
      filter(rolesActions.claimRole.match),
      mergeMap((action) => {
        const { input, operationId, activeOperationId, claimableOperationId } = action.payload;
        // Activation success starts one coordinated refresh of both role domains.
        return defer(() => provider.claimRole(input)).pipe(
          mergeMap((result) => {
            // Refresh failures belong to collections, never to the committed activation.
            return concat(
              of(rolesActions.refreshAfterClaim(activeOperationId, claimableOperationId)),
              refreshRolesAfterMutation(provider, activeOperationId, claimableOperationId),
              of(rolesActions.claimRole.success(result, operationId)),
            );
          }),
          catchError((error: unknown) => of(rolesActions.claimRole.failure(error, operationId))),
        );
      }),
    );
  };

/**
 * Settles each deactivation after its independent collection refreshes.
 * @param provider - Provider performing deactivation.
 * @returns A mutation flow that separates deactivation and collection failures.
 */
const deactivateRoleFlow =
  (provider: IRolesProvider): Flow<RolesAction, RolesState> =>
  (action$) => {
    // Keep concurrent deactivations correlated and refresh both domains after each mutation.
    return action$.pipe(
      filter(rolesActions.deactivateRole.match),
      mergeMap((action) => {
        const { input, operationId, activeOperationId, claimableOperationId } = action.payload;
        // Deactivation success starts one coordinated refresh of active and claimable assignments.
        return defer(() => provider.deactivateRole(input)).pipe(
          mergeMap((result) => {
            // Refresh failures belong to collections, never to the committed deactivation.
            return concat(
              of(rolesActions.refreshAfterDeactivate(activeOperationId, claimableOperationId)),
              refreshRolesAfterMutation(provider, activeOperationId, claimableOperationId),
              of(rolesActions.deactivateRole.success(result, operationId)),
            );
          }),
          catchError((error: unknown) =>
            of(rolesActions.deactivateRole.failure(error, operationId)),
          ),
        );
      }),
    );
  };

/**
 * Creates the combined Roles V2 side-effect flow.
 *
 * @param provider - App-scoped Roles module provider used for API operations.
 * @returns A flow handling collection loads and role activation.
 */
export const createRolesFlow = (provider: IRolesProvider): Flow<RolesAction, RolesState> => {
  const activeRolesFlow = loadActiveRolesFlow(provider);
  const claimableRolesFlow = loadClaimableRolesFlow(provider);
  const activateRoleFlow = claimRoleFlow(provider);
  const deactivateFlow = deactivateRoleFlow(provider);
  return (action$, state$) =>
    merge(
      activeRolesFlow(action$, state$),
      claimableRolesFlow(action$, state$),
      activateRoleFlow(action$, state$),
      deactivateFlow(action$, state$),
    );
};
