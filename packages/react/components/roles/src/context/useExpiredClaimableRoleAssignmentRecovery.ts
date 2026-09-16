import { useCallback, useEffect, useRef, useState } from 'react';

import type { ClaimableRoleAssignmentSelection } from '../components/overview/role-details';
import { parseRoleDate } from '../dates/parse-role-date';
import type {
  ConsolidatedClaimableRoleAssignments,
  RoleAssignmentCollectionState,
} from '../state/roles-state';

/** One activation period already presented or intentionally ended by the user. */
interface SuppressedActivation {
  readonly activeTo: string | null | undefined;
}

/** Recovery queue and stable actions scoped to one module provider. */
interface ExpiredClaimableRoleAssignmentRecovery {
  readonly claimableRoleAssignment: ClaimableRoleAssignmentSelection | undefined;
  readonly dismiss: () => void;
  readonly complete: (assignmentId: string) => void;
  readonly suppress: (assignmentId: string) => () => void;
}

/**
 * Queues newly expired claimable role assignments without interrupting the current audit form.
 * @param collection - Latest consolidated claimable-role-assignment collection for this provider.
 * @returns Sequential recovery prompts and period-scoped suppression controls.
 */
export const useExpiredClaimableRoleAssignmentRecovery = (
  collection: RoleAssignmentCollectionState<ConsolidatedClaimableRoleAssignments>,
): ExpiredClaimableRoleAssignmentRecovery => {
  const previous = useRef<ConsolidatedClaimableRoleAssignments | undefined>(undefined);
  const suppressed = useRef(new Map<string, SuppressedActivation>());
  const [queue, setQueue] = useState<readonly ClaimableRoleAssignmentSelection[]>([]);

  useEffect(() => {
    // Failed and in-flight reads must not consume expiry transitions from a partial snapshot.
    if (collection.status !== 'success') {
      return;
    }
    const now = Date.now();
    const expiredAssignments: ClaimableRoleAssignmentSelection[] = [];
    // Collect every expiry before advancing the snapshot so simultaneous transitions are not lost.
    for (const assignment of collection.assignments) {
      const id = assignment.id;
      // Roles V2 mutation endpoints need an assignment ID, not a role name.
      if (!id) {
        // Unaddressable metadata cannot produce an actionable recovery dialog.
        continue;
      }
      // Match by assignment rather than role name because scopes may grant the same named role.
      const old = previous.current?.find((previousAssignment) => previousAssignment.id === id);
      const activeTo = parseRoleDate(assignment.activeTo);
      const isActive =
        assignment.isActive === true &&
        (activeTo.status === 'missing' ||
          (activeTo.status === 'valid' && activeTo.timestamp > now));
      const suppression = suppressed.current.get(id);
      // A new observed activation restores recovery, including ordinary overview activation.
      // The same still-active snapshot after deactivation is not evidence of a new period.
      if (
        suppression &&
        isActive &&
        (old?.isActive !== true || suppression.activeTo !== assignment.activeTo)
      ) {
        suppressed.current.delete(id);
      }
      const justExpired =
        (old?.isActive === true && assignment.isActive !== true) ||
        (assignment.isActive === true && activeTo.status === 'valid' && activeTo.timestamp <= now);
      // Only unseen activation periods may interrupt the user with a recovery prompt.
      if (!justExpired || suppressed.current.has(id)) {
        // Repeated snapshots must not reopen a dismissed or intentionally ended activation.
        continue;
      }
      // Mark every queued period, not only the first, so later refreshes cannot duplicate prompts.
      suppressed.current.set(id, { activeTo: assignment.activeTo });
      const claimableRole = assignment.claimableRole;
      const displayName = claimableRole?.displayName ?? claimableRole?.name ?? 'Unknown role';
      expiredAssignments.push({
        assignmentId: id,
        name: claimableRole?.name ?? displayName,
        displayName,
        description: claimableRole?.description ?? 'No description is available.',
      });
    }
    previous.current = collection.assignments;
    // Preserve the open form and append new expiries without causing no-op queue updates.
    if (expiredAssignments.length > 0) {
      // Retain existing queue order so background refresh never replaces the current audit form.
      setQueue((current) => [...current, ...expiredAssignments]);
    }
  }, [collection]);

  /**
   * Advances only the resolved assignment; simultaneous expiries remain available in order.
   * @param assignmentId - Assignment whose recovery completed.
   */
  const complete = useCallback((assignmentId: string): void => {
    setQueue((current) => {
      // Remove just this assignment so successful recovery cannot dismiss a sibling expiry.
      return current.filter((selection) => selection.assignmentId !== assignmentId);
    });
  }, []);

  /** Keeps dismissal scoped to this activation period rather than the lifetime of the provider. */
  const dismiss = useCallback((): void => {
    setQueue((current) => current.slice(1));
  }, []);

  /**
   * Prevents intentional deactivation from looking like an unexpected expiry.
   * @param assignmentId - Assignment about to be deactivated.
   * @returns Rollback of this suppression if the mutation fails.
   */
  const suppress = useCallback((assignmentId: string): (() => void) => {
    const old = suppressed.current.get(assignmentId);
    // Capture the current period before mutation; the next read may already show it as inactive.
    const previousActivation = previous.current?.find(
      (previousAssignment) => previousAssignment.id === assignmentId,
    );
    const activation = {
      activeTo: previousActivation?.activeTo,
    };
    suppressed.current.set(assignmentId, activation);
    return () => {
      // A later activation/suppression owns the entry if an overlapping mutation has replaced it.
      if (suppressed.current.get(assignmentId) !== activation) {
        return;
      }
      // Restore a prior dismissal rather than making an already acknowledged period prompt again.
      if (old) {
        suppressed.current.set(assignmentId, old);
      } else {
        suppressed.current.delete(assignmentId);
      }
    };
  }, []);

  return { claimableRoleAssignment: queue[0], dismiss, complete, suppress };
};
