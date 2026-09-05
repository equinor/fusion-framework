import { useRolesContext } from '../context/useRolesContext';
import type { ActiveRoles } from '../state/roles-state';

/**
 * Reactive active-role state for the current Fusion app account.
 */
export interface UseRolesResult {
  /** Active access-role assignments for the current account. */
  readonly roles: ActiveRoles;
  /** Whether an initial load or background refresh is running; existing roles remain available. */
  readonly isLoading: boolean;
  /** Error from the latest active-role request. */
  readonly error: unknown;
  /**
   * Refreshes active assignments with a stable action identity for this provider lifetime.
   * Resolves after this read settles, including read failures reported in `error`.
   * Rejects if the provider scope is disposed before settlement.
   */
  readonly reload: () => Promise<void>;
}

/**
 * Reads active Roles V2 assignments from the nearest `RolesProvider`.
 * Collection state is a UI snapshot, not a continuous authorization decision.
 *
 * @returns Active roles with loading, error, and reload state.
 * @throws When called outside a `RolesProvider`.
 *
 * @example
 * ```tsx
 * const { roles, isLoading, error } = useRoles();
 * ```
 */
export const useRoles = (): UseRolesResult => useRolesContext().active;
