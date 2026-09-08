import { useRolesContext } from '../context/useRolesContext';
import type { ActiveAccessRoleAssignments } from '../state/roles-state';

/**
 * Reactive active access-role assignment state for the current Fusion app account.
 */
export interface UseActiveAccessRoleAssignmentsResult {
  /** Effective access-role assignments for the current account. */
  readonly assignments: ActiveAccessRoleAssignments;
  /**
   * Whether an initial load or background refresh is running; existing assignments remain
   * available.
   */
  readonly isLoading: boolean;
  /** Error from the latest active access-role assignment request. */
  readonly error: unknown;
  /**
   * Refreshes active access-role assignments with a stable action identity for this provider
   * lifetime. Resolves after this read settles, including read failures reported in `error`.
   * Rejects if the provider scope is disposed before settlement.
   */
  readonly reload: () => Promise<void>;
}

/**
 * Reads effective active access-role assignments from the nearest `RolesProvider`.
 *
 * @remarks
 * `/active-access-role-assignments` returns currently effective, deduplicated assignments with
 * provenance dropped. Collection state is a UI snapshot, not a continuous authorization decision,
 * and does not identify whether access originated from a standing role assignment or an activated
 * claimable role assignment.
 *
 * @returns Active access-role assignments with loading, error, and reload state.
 * @throws When called outside a `RolesProvider`.
 *
 * @example
 * ```tsx
 * const { assignments, isLoading, error } = useActiveAccessRoleAssignments();
 * ```
 */
export const useActiveAccessRoleAssignments = (): UseActiveAccessRoleAssignmentsResult =>
  useRolesContext().activeAccessRoleAssignments;
