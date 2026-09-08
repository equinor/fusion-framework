import { useMemo, useState } from 'react';

import {
  useActiveAccessRoleAssignments,
  type UseActiveAccessRoleAssignmentsResult,
} from '../../hooks/useActiveAccessRoleAssignments';
import {
  useClaimableRoleAssignments,
  type UseClaimableRoleAssignmentsResult,
} from '../../hooks/useClaimableRoleAssignments';
import { useRoleAssignments, type UseRoleAssignmentsResult } from '../../hooks/useRoleAssignments';
import { createClaimableRoles } from './create-claimable-roles';
import { createAssignedRoles } from './create-assigned-roles';
import type {
  AssignedRoleDetails,
  ClaimableRoleAssignmentSelection,
  ClaimableRoleDetails,
} from './role-details';

/** Shared collection and activation controller for the two role browsing layouts. */
interface RolesOverview {
  readonly activeAccessRoleAssignments: UseActiveAccessRoleAssignmentsResult;
  readonly consolidatedClaimableRoleAssignments: UseClaimableRoleAssignmentsResult;
  readonly consolidatedRoleAssignments: UseRoleAssignmentsResult;
  readonly claimableRoles: readonly ClaimableRoleDetails[];
  readonly assignedRoles: readonly AssignedRoleDetails[];
  readonly selectedClaimableRoleAssignment?: ClaimableRoleAssignmentSelection;
  readonly selectClaimableRoleAssignment: (
    selection: ClaimableRoleAssignmentSelection | undefined,
  ) => void;
  readonly activateClaimableRoleAssignment: (
    assignmentId: string,
    reason: string,
    hours: number,
  ) => Promise<void>;
  readonly deactivateClaimableRoleAssignment: (assignmentId: string) => Promise<void>;
  readonly reload: () => Promise<void>;
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
  readonly loadError: unknown;
}

/**
 * Coordinates shared role-assignment collections and dialog selection without owning a
 * presentation layout.
 * @returns Provider state, normalized role cards, and audited mutation callbacks.
 */
export const useRolesOverview = (): RolesOverview => {
  const activeAccessRoleAssignments = useActiveAccessRoleAssignments();
  const consolidatedClaimableRoleAssignments = useClaimableRoleAssignments();
  const consolidatedRoleAssignments = useRoleAssignments();
  const [selectedClaimableRoleAssignment, selectClaimableRoleAssignment] =
    useState<ClaimableRoleAssignmentSelection>();
  const [hasSettled, setHasSettled] = useState(false);
  const claimableRoles = useMemo(
    () => createClaimableRoles(consolidatedClaimableRoleAssignments.assignments),
    [consolidatedClaimableRoleAssignments.assignments],
  );
  const assignedRoles = useMemo(
    () => createAssignedRoles(consolidatedRoleAssignments.assignments),
    [consolidatedRoleAssignments.assignments],
  );
  const isLoading =
    activeAccessRoleAssignments.isLoading ||
    consolidatedClaimableRoleAssignments.isLoading ||
    consolidatedRoleAssignments.isLoading;
  // Once first reads settle, even an empty account is a usable view. Never unmount audit forms
  // for subsequent refreshes; collection errors instead explain that the retained snapshot is stale.
  if (!hasSettled && !isLoading) {
    setHasSettled(true);
  }

  /**
   * Closes selection after activation succeeds and its collection refreshes settle.
   * @param assignmentId - Selected claimable role assignment identifier.
   * @param reason - User-provided audit reason.
   * @param hours - Requested activation duration.
   * @returns Completion of the provider-backed activation.
   * @throws Provider failures for the claim dialog to display.
   */
  const activateClaimableRoleAssignment = async (
    assignmentId: string,
    reason: string,
    hours: number,
  ): Promise<void> => {
    await consolidatedClaimableRoleAssignments.activateClaimableRoleAssignment({
      assignmentId,
      reason,
      hours,
    });
    selectClaimableRoleAssignment(undefined);
  };

  /**
   * Ends an activation without changing the account's claimable entitlement.
   * @param assignmentId - Claimable role assignment to deactivate.
   * @returns Completion of the provider-backed deactivation.
   */
  const deactivateClaimableRoleAssignment = async (assignmentId: string): Promise<void> => {
    await consolidatedClaimableRoleAssignments.deactivateClaimableRoleAssignment({ assignmentId });
  };

  /**
   * Reloads every collection so no tab keeps an outdated account snapshot.
   * @returns Completion of all collection requests.
   */
  const reload = async (): Promise<void> => {
    await Promise.all([
      activeAccessRoleAssignments.reload(),
      consolidatedClaimableRoleAssignments.reload(),
      consolidatedRoleAssignments.reload(),
    ]);
  };

  return {
    activeAccessRoleAssignments,
    consolidatedClaimableRoleAssignments,
    consolidatedRoleAssignments,
    claimableRoles,
    assignedRoles,
    selectedClaimableRoleAssignment,
    selectClaimableRoleAssignment,
    activateClaimableRoleAssignment,
    deactivateClaimableRoleAssignment,
    reload,
    isLoading: isLoading && !hasSettled,
    isRefreshing: isLoading && hasSettled,
    loadError:
      activeAccessRoleAssignments.error ??
      consolidatedClaimableRoleAssignments.error ??
      consolidatedRoleAssignments.error,
  };
};
