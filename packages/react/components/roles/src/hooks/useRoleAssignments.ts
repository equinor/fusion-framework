import { useRolesContext } from '../context/useRolesContext';
import type { ConsolidatedRoleAssignments } from '../state/roles-state';

/**
 * Reactive consolidated role-assignment state for the current Fusion app account.
 */
export interface UseRoleAssignmentsResult {
  /** Consolidated role assignments for the current account. */
  readonly assignments: ConsolidatedRoleAssignments;
  /**
   * Whether an initial load or background refresh is running; existing assignments remain
   * available.
   */
  readonly isLoading: boolean;
  /** Error from the latest consolidated role-assignment request. */
  readonly error: unknown;
  /**
   * Refreshes assignments with a stable action identity for this provider lifetime.
   * Resolves after this read settles, including read failures reported in `error`.
   * Rejects if the provider scope is disposed before settlement.
   */
  readonly reload: () => Promise<void>;
}

/**
 * Reads consolidated role assignments from the nearest `RolesProvider`.
 *
 * @remarks
 * `/consolidated-role-assignments` returns standing, non-claimable role assignments that Roles V2
 * never calls permanent — they may still be validity-bounded. `assignmentType` reported on
 * {@link useActiveAccessRoleAssignments | active access-role} assignments cannot reliably
 * distinguish this standing grant from an activated claimable role assignment, so consumers must
 * read this hook instead of inferring provenance from active access-role assignments. Collection
 * state is a UI snapshot, not a continuous authorization decision.
 *
 * @returns Consolidated role assignments with loading, error, and reload state.
 * @throws When called outside a `RolesProvider`.
 *
 * @example
 * ```tsx
 * const { assignments, isLoading, error } = useRoleAssignments();
 * ```
 */
export const useRoleAssignments = (): UseRoleAssignmentsResult =>
  useRolesContext().consolidatedRoleAssignments;
