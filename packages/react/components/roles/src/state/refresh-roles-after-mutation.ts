import { defer, merge, of, type Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import type { IRolesProvider } from '@equinor/fusion-framework-module-roles';

import { rolesActions, type RolesAction } from './roles-actions';

/**
 * Refreshes both collections without turning a committed mutation into a failed operation.
 *
 * @param provider - Provider whose mutation has already invalidated its role caches.
 * @param activeOperationId - Correlation identifier for the active collection refresh.
 * @param claimableOperationId - Correlation identifier for the claimable collection refresh.
 * @returns Independent collection outcomes, completing only after both reads settle.
 */
export const refreshRolesAfterMutation = (
  provider: IRolesProvider,
  activeOperationId: number,
  claimableOperationId: number,
): Observable<RolesAction> => {
  // Defer invocation as well as rejection handling: injected providers may throw synchronously.
  const active = defer(() => provider.getActiveRoles()).pipe(
    map((roles) => rolesActions.loadActive.success(roles, activeOperationId)),
    catchError((error: unknown) => of(rolesActions.loadActive.failure(error, activeOperationId))),
  );
  // Keep this failure inside its own read so a failed or slow sibling cannot hide its result.
  const claimable = defer(() => provider.getClaimableRoles()).pipe(
    map((roles) => rolesActions.loadClaimable.success(roles, claimableOperationId)),
    catchError((error: unknown) =>
      of(rolesActions.loadClaimable.failure(error, claimableOperationId)),
    ),
  );
  return merge(active, claimable);
};
