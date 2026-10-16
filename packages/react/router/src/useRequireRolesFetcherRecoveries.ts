import { useContext, useEffect, useSyncExternalStore } from 'react';
import { useMatches } from 'react-router';

import type { RequireRolesFetcherRecovery } from './RequireRolesFetcherRecovery.js';
import type { RouteRecoveryScope } from './RouteRecoveryScope.js';
import { routeRecoveryScopeReactContext } from './route-recovery-scope-react-context.js';

/**
 * Requires the recovery scope of an enclosing Fusion `Router`.
 *
 * @param scope - Value of the scope React context.
 * @returns The scope.
 * @throws {Error} When there is no enclosing Fusion `Router`.
 */
const requireScope = (scope: RouteRecoveryScope | null): RouteRecoveryScope => {
  // Holds belong to one router; there is nothing to host outside a Fusion `Router`.
  if (!scope) {
    throw new Error(
      'useRequireRolesFetcherRecoveries must be used inside a Fusion Router from @equinor/fusion-framework-react-router.',
    );
  }
  return scope;
};

/**
 * Hosts recovery for `requireRoles` denials of fetcher executions and returns the pending holds.
 *
 * While at least one component uses this hook, a fetcher load or submission denied by
 * `requireRoles` is held instead of failed: its owner stays mounted with the same fetcher key and
 * `state`. Render the existing Roles recovery UI for every returned hold. After the user activates
 * access, `hold.retry()` runs a fresh `refresh: true` check and, when access is granted, resumes the
 * original execution exactly once, so `fetcher.data` reaches every consumer of the key. `dismiss()`
 * ends the hold and shows the denial at the owner's error boundary.
 *
 * Mount the host in a layout that outlives the routes it covers. When the last host unmounts,
 * pending holds are dismissed so no fetcher stays pending invisibly. Holds whose owner route was
 * left by a navigation end without running; React Router discards their outcome because the owner
 * unmounted. Without any host, denied
 * fetcher executions fail at the owner's error boundary and are not recoverable.
 *
 * @returns Pending holds of the enclosing router, oldest first.
 * @throws {Error} When used outside a Fusion `Router`.
 *
 * @example
 * ```tsx
 * import { RoleErrorView } from '@equinor/fusion-framework-react-components-roles';
 * import { useRequireRolesFetcherRecoveries } from '@equinor/fusion-framework-react-router';
 *
 * export const FetcherAccessRecovery = () => {
 *   const holds = useRequireRolesFetcherRecoveries();
 *   return holds.map((hold) => (
 *     <RoleErrorView key={hold.id} error={hold.error} onRetry={() => void hold.retry()} />
 *   ));
 * };
 * ```
 */
export const useRequireRolesFetcherRecoveries = (): readonly RequireRolesFetcherRecovery[] => {
  const scope = requireScope(useContext(routeRecoveryScopeReactContext));
  // Register as host only while mounted, so denials are never held for an absent UI.
  useEffect(() => scope.addFetcherHost(), [scope]);
  const matches = useMatches();
  // Runs after the commit that unmounted owners of routes left by a navigation; their held
  // executions can no longer deliver a result, so they end without running.
  useEffect(() => {
    // Fetcher owners record the id of the route that rendered them; matched ids are those routes.
    scope.dismissFetcherHoldsOutside(matches.map((match) => match.id));
  }, [scope, matches]);
  return useSyncExternalStore(
    scope.subscribeFetcherHolds,
    scope.getFetcherHolds,
    scope.getFetcherHolds,
  );
};

export default useRequireRolesFetcherRecoveries;
