import { useEffect, useMemo, useSyncExternalStore } from 'react';

import type { HasAccessRoleOptions, RolesModule } from '@equinor/fusion-framework-module-roles';
import { createAccessRoleCheck } from '@equinor/fusion-framework-module-roles';

import { useAppModule } from '../useAppModule.js';

/** Options for selecting any-role or all-role active access checks. */
export type UseHasAccessRoleOptions = Pick<HasAccessRoleOptions, 'required'>;

/**
 * Active access-role state returned by {@link useHasAccessRole}.
 */
export interface UseHasAccessRoleResult {
  /** Whether the current any-role or all-role condition is satisfied. */
  hasAccessRole: boolean | undefined;
  /** Whether the initial check or an explicit refresh is running. */
  isLoading: boolean;
  /** Error from the latest active access-role check. */
  error: unknown;
  /** Re-runs the active access-role check for the current provider and inputs. */
  refresh: () => Promise<void>;
}

/**
 * Checks whether any or all requested Roles V2 access roles are currently active.
 *
 * The hook calls only {@link IRolesProvider.hasAccessRole}; it does not load claimable-role
 * assignments or expose activation actions. Use `useAccessRole` when the UI also needs to discover
 * and activate a claimable role assignment.
 *
 * Role names follow the provider's exact, case-sensitive matching semantics. Set `required` to
 * `true` to require every role, or leave it `false` to accept any role. Empty lists preserve the
 * provider identities: all-role checks resolve to `true`, while any-role checks resolve to `false`.
 *
 * @param accessRoleNames - Exact Roles V2 access-role names to check.
 * @param options - Selects all-role (`required: true`) or any-role (`required: false`) matching.
 * @returns Active access state with initial loading, refresh, and error handling.
 * @throws The function returned as `refresh` rethrows Roles V2 failures after updating `error`.
 *
 * @example
 * ```tsx
 * const access = useHasAccessRole(['Reports.Read', 'Reports.Export'], { required: false });
 *
 * if (access.isLoading) return <Spinner />;
 * if (access.error) return <ErrorMessage error={access.error} />;
 * return access.hasAccessRole ? <Reports /> : <NoAccess />;
 * ```
 */
export const useHasAccessRole = (
  accessRoleNames: readonly string[],
  options: UseHasAccessRoleOptions = {},
): UseHasAccessRoleResult => {
  const roles = useAppModule<RolesModule>('roles');
  const required = options.required === true;
  // Array identity is unstable for inline hook arguments; content controls the request lifecycle.
  const inputKey = JSON.stringify([accessRoleNames, required]);
  // inputKey captures the role-name contents so inline arrays do not recreate the flow.
  // biome-ignore lint/correctness/useExhaustiveDependencies: inputKey is the semantic identity of accessRoleNames and required.
  const check = useMemo(
    () => createAccessRoleCheck(roles, accessRoleNames, { required }),
    [inputKey, roles],
  );
  const state = useSyncExternalStore(check.subscribe, check.getSnapshot, check.getSnapshot);

  useEffect(() => {
    // The flow owns request state; effects only start the render-committed resource.
    void check.load().catch(() => undefined);
    // Subscription cleanup detaches React; keeping the immutable resource alive makes retained
    // refresh callbacks harmless across StrictMode replays and input changes.
  }, [check]);

  return {
    hasAccessRole: state.hasAccessRole,
    isLoading: state.isLoading,
    error: state.error,
    refresh: check.refresh,
  };
};
