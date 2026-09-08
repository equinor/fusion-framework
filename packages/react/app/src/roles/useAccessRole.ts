import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  ActivateClaimableRoleAssignmentInput,
  IRolesProvider,
  RolesModule,
} from '@equinor/fusion-framework-module-roles';

import { useAppModule } from '../useAppModule';

/** Result returned after a claimable role assignment activation succeeds. */
export type ClaimableRoleAssignmentActivationResult = Awaited<
  ReturnType<IRolesProvider['activateClaimableRoleAssignment']>
>;

/**
 * Reactive state and actions for one Roles V2 access role.
 */
export interface UseAccessRoleResult {
  /** Whether the access role is currently active, or `undefined` while the first check runs. */
  hasAccessRole: boolean | undefined;
  /** Whether a claimable role can grant the access role, or `undefined` while the first check runs. */
  hasClaimableRoleAssignmentForAccessRole: boolean | undefined;
  /** Whether active-access and claimable-assignment checks are running. */
  isChecking: boolean;
  /** Error from the latest access-role check. */
  checkError: unknown;
  /** Re-runs the active-access and claimable-assignment checks. */
  checkAccessRole: () => Promise<void>;
  /** Activates a claimable role assignment and refreshes access state after success. */
  activateClaimableRoleAssignment: (
    input: ActivateClaimableRoleAssignmentInput,
  ) => Promise<ClaimableRoleAssignmentActivationResult>;
  /** Whether a claimable-role-assignment activation is running. */
  isActivating: boolean;
  /** Error from the latest role activation request. */
  activationError: unknown;
}

/**
 * Checks one Roles V2 access role and activates a claimable role assignment when available.
 *
 * The hook checks both active access-role assignments and claimable access-role mappings when
 * mounted. A successful activation triggers a new check so rendered access state follows it.
 *
 * @param accessRoleName - Exact, case-sensitive Roles V2 access-role name to check.
 * @returns Access-role state and an activation action backed by the app-scoped Roles provider.
 * @throws The function returned as `activateClaimableRoleAssignment` rethrows cancellation and
 * Roles V2 failures.
 *
 * @example
 * ```tsx
 * const role = useAccessRole('Reports.Read');
 *
 * if (role.isChecking) return <Spinner />;
 * if (role.checkError) return <ErrorMessage error={role.checkError} />;
 * if (role.hasAccessRole) return <Reports />;
 *
 * // Consume the event-handler rejection; activationError below owns the visible failure.
 * const handleActivate = (): void => {
 *   void role.activateClaimableRoleAssignment({ assignmentId: claimableRoleId }).catch(() => undefined);
 * };
 *
 * return role.hasClaimableRoleAssignmentForAccessRole ? (
 *   <>
 *     {role.activationError ? <p role="alert">{String(role.activationError)}</p> : null}
 *     <button disabled={role.isActivating} onClick={handleActivate}>
 *       Claim access
 *     </button>
 *   </>
 * ) : null;
 * ```
 */
export const useAccessRole = (accessRoleName: string): UseAccessRoleResult => {
  const roles = useAppModule<RolesModule>('roles');
  const mountedRef = useRef(false);
  const checkRequestRef = useRef(0);
  const [hasAccessRole, setHasAccessRole] = useState<boolean>();
  const [hasClaimableRoleAssignmentForAccessRole, setHasClaimableRoleAssignmentForAccessRole] =
    useState<boolean>();
  const [isChecking, setIsChecking] = useState(true);
  const [checkError, setCheckError] = useState<unknown>();
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState<unknown>();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      checkRequestRef.current += 1;
    };
  }, []);

  const checkAccessRole = useCallback(async (): Promise<void> => {
    const requestId = ++checkRequestRef.current;
    // Keep previous values visible while callers explicitly refresh an already resolved role.
    if (mountedRef.current) {
      setIsChecking(true);
      setCheckError(undefined);
    }
    try {
      const [isActive, isClaimable] = await Promise.all([
        roles.hasAccessRole([accessRoleName], { required: true }),
        roles.hasClaimableRoleAssignmentForAccessRole(accessRoleName),
      ]);
      // Only the latest check may update state after role names or providers change.
      if (mountedRef.current && checkRequestRef.current === requestId) {
        setHasAccessRole(isActive);
        setHasClaimableRoleAssignmentForAccessRole(isClaimable);
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
    setHasAccessRole(undefined);
    setHasClaimableRoleAssignmentForAccessRole(undefined);
    // Automatic checks expose failures through checkError because effects cannot return promises.
    void checkAccessRole().catch(() => undefined);
  }, [checkAccessRole]);

  const activateClaimableRoleAssignment = useCallback(
    async (
      input: ActivateClaimableRoleAssignmentInput,
    ): Promise<ClaimableRoleAssignmentActivationResult> => {
      // Activation state is independent from checks so UIs can render each operation explicitly.
      if (mountedRef.current) {
        setIsActivating(true);
        setActivationError(undefined);
      }
      try {
        const result = await roles.activateClaimableRoleAssignment(input);
        // Successful activation invalidates provider caches; refresh the rendered access state.
        void checkAccessRole().catch(() => undefined);
        return result;
      } catch (error) {
        // Callers receive the original failure while React consumers can also render activationError.
        if (mountedRef.current) {
          setActivationError(error);
        }
        throw error;
      } finally {
        // Avoid scheduling state updates after the component using the hook has unmounted.
        if (mountedRef.current) {
          setIsActivating(false);
        }
      }
    },
    [checkAccessRole, roles],
  );

  return {
    hasAccessRole,
    hasClaimableRoleAssignmentForAccessRole,
    isChecking,
    checkError,
    checkAccessRole,
    activateClaimableRoleAssignment,
    isActivating,
    activationError,
  };
};
