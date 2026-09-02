import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  ClaimRoleInput,
  IRolesProvider,
  RolesModule,
} from '@equinor/fusion-framework-module-roles';

import { useAppModule } from '../useAppModule';

/**
 * Result returned after a role claim succeeds.
 */
export type RoleClaimResult = Awaited<ReturnType<IRolesProvider['claimRole']>>;

/**
 * Reactive state and actions for one Roles V2 access role.
 */
export interface UseRoleResult {
  /** Whether the access role is currently active, or `undefined` while the first check runs. */
  hasRole: boolean | undefined;
  /** Whether a claimable role can grant the access role, or `undefined` while the first check runs. */
  canClaimAccessRole: boolean | undefined;
  /** Whether active-role and claim-eligibility checks are running. */
  isChecking: boolean;
  /** Error from the latest role check. */
  checkError: unknown;
  /** Re-runs the active-role and claim-eligibility checks. */
  checkRole: () => Promise<void>;
  /** Claims a role assignment and refreshes role state after activation succeeds. */
  claimRole: (input: ClaimRoleInput) => Promise<RoleClaimResult>;
  /** Whether a role activation request is running. */
  isClaiming: boolean;
  /** Error from the latest role activation request. */
  claimError: unknown;
}

/**
 * Checks and claims Roles V2 access for the current Fusion app account.
 *
 * The hook checks both active access-role assignments and claimable access-role mappings when
 * mounted. A successful claim triggers a new check so rendered access state follows the activation.
 *
 * @param accessRoleName - Exact, case-sensitive Roles V2 access-role name to check.
 * @returns Role check state and a claim action backed by the app-scoped Roles provider.
 * @throws The function returned as `claimRole` rethrows claim cancellation and Roles V2 failures.
 *
 * @example
 * ```tsx
 * const role = useRole('Reports.Read');
 *
 * if (role.isChecking) return <Spinner />;
 * if (role.checkError) return <ErrorMessage error={role.checkError} />;
 * if (role.hasRole) return <Reports />;
 *
 * return role.canClaimAccessRole ? (
 *   <button
 *     disabled={role.isClaiming}
 *     onClick={() => role.claimRole({ roleId: claimableRoleId })}
 *   >
 *     Claim access
 *   </button>
 * ) : null;
 * ```
 */
export const useRole = (accessRoleName: string): UseRoleResult => {
  const roles = useAppModule<RolesModule>('roles');
  const mountedRef = useRef(false);
  const checkRequestRef = useRef(0);
  const [hasRole, setHasRole] = useState<boolean>();
  const [canClaimAccessRole, setCanClaimAccessRole] = useState<boolean>();
  const [isChecking, setIsChecking] = useState(true);
  const [checkError, setCheckError] = useState<unknown>();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<unknown>();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      checkRequestRef.current += 1;
    };
  }, []);

  const checkRole = useCallback(async (): Promise<void> => {
    const requestId = ++checkRequestRef.current;
    // Keep previous values visible while callers explicitly refresh an already resolved role.
    if (mountedRef.current) {
      setIsChecking(true);
      setCheckError(undefined);
    }
    try {
      const [isActive, isClaimable] = await Promise.all([
        roles.hasRole([accessRoleName], { required: true }),
        roles.canClaimAccessRole(accessRoleName),
      ]);
      // Only the latest check may update state after role names or providers change.
      if (mountedRef.current && checkRequestRef.current === requestId) {
        setHasRole(isActive);
        setCanClaimAccessRole(isClaimable);
      }
    } catch (error) {
      // Surface failures as hook state while preserving rejection for explicit refresh callers.
      if (mountedRef.current && checkRequestRef.current === requestId) {
        setCheckError(error);
      }
      throw error;
    } finally {
      // A stale request must not mark a newer role check as complete.
      if (mountedRef.current && checkRequestRef.current === requestId) {
        setIsChecking(false);
      }
    }
  }, [accessRoleName, roles]);

  useEffect(() => {
    // A changed role name must not render access resolved for the previous role while checking.
    setHasRole(undefined);
    setCanClaimAccessRole(undefined);
    // Automatic checks expose failures through checkError because effects cannot return promises.
    void checkRole().catch(() => undefined);
  }, [checkRole]);

  const claimRole = useCallback(
    async (input: ClaimRoleInput): Promise<RoleClaimResult> => {
      // Claim state is independent from checks so UIs can render each operation explicitly.
      if (mountedRef.current) {
        setIsClaiming(true);
        setClaimError(undefined);
      }
      try {
        const result = await roles.claimRole(input);
        // Successful activation invalidates provider caches; refresh the rendered access state.
        void checkRole().catch(() => undefined);
        return result;
      } catch (error) {
        // Callers receive the original failure while React consumers can also render claimError.
        if (mountedRef.current) {
          setClaimError(error);
        }
        throw error;
      } finally {
        // Avoid scheduling state updates after the component using the hook has unmounted.
        if (mountedRef.current) {
          setIsClaiming(false);
        }
      }
    },
    [checkRole, roles],
  );

  return {
    hasRole,
    canClaimAccessRole,
    isChecking,
    checkError,
    checkRole,
    claimRole,
    isClaiming,
    claimError,
  };
};
