import { defer, merge, of, type Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import type { IRolesProvider } from '@equinor/fusion-framework-module-roles';

import { rolesActions, type RolesAction } from './roles-actions';

/**
 * Refreshes both mutated collections without turning a committed mutation into a failed operation.
 *
 * @param provider - Provider whose mutation has already invalidated its role-assignment caches.
 * @param activeAccessOperationId - Correlation identifier for the active access-role assignment refresh.
 * @param claimableOperationId - Correlation identifier for the consolidated claimable-role-assignment refresh.
 * @returns Independent collection outcomes, completing only after both reads settle.
 */
export const refreshRoleAssignmentsAfterMutation = (
  provider: IRolesProvider,
  activeAccessOperationId: number,
  claimableOperationId: number,
): Observable<RolesAction> => {
  // Defer invocation as well as rejection handling: injected providers may throw synchronously.
  const activeAccessRoleAssignments = defer(() => provider.getActiveAccessRoleAssignments()).pipe(
    map((assignments) =>
      rolesActions.loadActiveAccessRoleAssignments.success(assignments, activeAccessOperationId),
    ),
    catchError((error: unknown) =>
      of(rolesActions.loadActiveAccessRoleAssignments.failure(error, activeAccessOperationId)),
    ),
  );
  // Keep this failure inside its own read so a failed or slow sibling cannot hide its result.
  const consolidatedClaimableRoleAssignments = defer(() =>
    provider.getConsolidatedClaimableRoleAssignments(),
  ).pipe(
    map((assignments) =>
      rolesActions.loadConsolidatedClaimableRoleAssignments.success(
        assignments,
        claimableOperationId,
      ),
    ),
    catchError((error: unknown) =>
      of(
        rolesActions.loadConsolidatedClaimableRoleAssignments.failure(error, claimableOperationId),
      ),
    ),
  );
  return merge(activeAccessRoleAssignments, consolidatedClaimableRoleAssignments);
};
