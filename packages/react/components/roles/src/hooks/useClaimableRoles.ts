import { useRolesContext } from '../context/useRolesContext';
import type { ClaimableRoles, RoleClaimResult, RoleDeactivateResult } from '../state/roles-state';
import type { ClaimRoleInput, DeactivateRoleInput } from '@equinor/fusion-framework-module-roles';

/**
 * Reactive claimable-role state and actions for the current Fusion app account.
 */
export interface UseClaimableRolesResult {
  /** Claimable role assignments for the current account. */
  readonly roles: ClaimableRoles;
  /** Whether an initial load or background refresh is running; existing roles remain available. */
  readonly isLoading: boolean;
  /** Error from the latest claimable-role request. */
  readonly error: unknown;
  /**
   * Refreshes assignments; resolves on read success or failure (see `error`).
   * Rejects on scope disposal. Identity stays stable for the current provider lifetime.
   */
  readonly reload: () => Promise<void>;
  /**
   * Activates the assignment identified by `input.roleId`, not an access-role name.
   * Rejects mutation failure or disposal. Resolves the mutation result after both refreshes
   * settle, even when refresh errors occur; those belong to collection `error` state.
   * Identity stays stable for the current provider lifetime.
   */
  readonly claimRole: (input: ClaimRoleInput) => Promise<RoleClaimResult>;
  /**
   * Ends the activation identified by `input.roleId`, retaining its claimable entitlement.
   * Has the same rejection, refresh-settlement, and stable-identity contract as `claimRole`.
   */
  readonly deactivateRole: (input: DeactivateRoleInput) => Promise<RoleDeactivateResult>;
  /** Whether any activation or its subsequent refresh is still pending. */
  readonly isClaiming: boolean;
  /** Error from the latest role activation request. */
  readonly claimError: unknown;
  /** Whether any deactivation or its subsequent refresh is still pending. */
  readonly isDeactivating: boolean;
  /** Error from the latest role deactivation request. */
  readonly deactivateError: unknown;
}

/**
 * Reads claimable Roles V2 assignments and mutation state from the nearest `RolesProvider`.
 * Mutation actions reject asynchronously; catch their promises in event handlers.
 *
 * @returns Claimable roles with loading, error, reload, activation, and deactivation state.
 * @throws When called outside a `RolesProvider`.
 *
 * @example
 * ```tsx
 * const { roles, claimRole, isClaiming } = useClaimableRoles();
 * ```
 */
export const useClaimableRoles = (): UseClaimableRolesResult => useRolesContext().claimable;
