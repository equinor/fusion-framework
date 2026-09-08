import type {
  ActivateClaimableRoleAssignmentInput,
  DeactivateClaimableRoleAssignmentInput,
} from '@equinor/fusion-framework-module-roles';

import { useRolesContext } from '../context/useRolesContext';
import type {
  ClaimableRoleAssignmentActivationResult,
  ClaimableRoleAssignmentDeactivationResult,
  ConsolidatedClaimableRoleAssignments,
} from '../state/roles-state';

/**
 * Reactive consolidated claimable-role-assignment state and actions for the current Fusion app
 * account.
 */
export interface UseClaimableRoleAssignmentsResult {
  /** Claimable role assignments for the current account. */
  readonly assignments: ConsolidatedClaimableRoleAssignments;
  /**
   * Whether an initial load or background refresh is running; existing assignments remain
   * available.
   */
  readonly isLoading: boolean;
  /** Error from the latest consolidated claimable-role-assignment request. */
  readonly error: unknown;
  /**
   * Refreshes assignments; resolves on read success or failure (see `error`).
   * Rejects on scope disposal. Identity stays stable for the current provider lifetime.
   */
  readonly reload: () => Promise<void>;
  /**
   * Activates the claimable role assignment identified by `input.assignmentId`, not an
   * access-role name. Rejects mutation failure or disposal. Resolves the mutation result after
   * both refreshes settle, even when refresh errors occur; those belong to collection `error`
   * state. Identity stays stable for the current provider lifetime.
   */
  readonly activateClaimableRoleAssignment: (
    input: ActivateClaimableRoleAssignmentInput,
  ) => Promise<ClaimableRoleAssignmentActivationResult>;
  /**
   * Ends the activation identified by `input.assignmentId`, retaining its claimable entitlement.
   * Has the same rejection, refresh-settlement, and stable-identity contract as
   * `activateClaimableRoleAssignment`.
   */
  readonly deactivateClaimableRoleAssignment: (
    input: DeactivateClaimableRoleAssignmentInput,
  ) => Promise<ClaimableRoleAssignmentDeactivationResult>;
  /** Whether any activation or its subsequent refresh is still pending. */
  readonly isActivating: boolean;
  /** Error from the latest claimable-role-assignment activation request. */
  readonly activationError: unknown;
  /** Whether any deactivation or its subsequent refresh is still pending. */
  readonly isDeactivating: boolean;
  /** Error from the latest claimable-role-assignment deactivation request. */
  readonly deactivationError: unknown;
}

/**
 * Reads consolidated claimable role assignments and mutation state from the nearest
 * `RolesProvider`. Mutation actions reject asynchronously; catch their promises in event handlers.
 *
 * @returns Claimable role assignments with loading, error, reload, activation, and deactivation state.
 * @throws When called outside a `RolesProvider`.
 *
 * @example
 * ```tsx
 * const { assignments, activateClaimableRoleAssignment, isActivating } =
 *   useClaimableRoleAssignments();
 * ```
 */
export const useClaimableRoleAssignments = (): UseClaimableRoleAssignmentsResult =>
  useRolesContext().consolidatedClaimableRoleAssignments;
