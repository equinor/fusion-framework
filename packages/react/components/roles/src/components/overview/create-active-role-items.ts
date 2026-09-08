import type { ActiveAccessRoleAssignments } from '../../state/roles-state';

/**
 * Active access-role assignment paired with a render key because the service does not expose an
 * assignment ID.
 */
interface ActiveRoleItem {
  readonly assignment: ActiveAccessRoleAssignments[number];
  readonly key: string;
}

/**
 * Gives every active assignment a scope-aware key without dropping indistinguishable duplicates.
 * Keys survive insertion, removal, or reordering of other identities. Identical assignments use
 * their occurrence within that identity because the service provides no finer discriminator.
 * @param assignments - Active assignments in display order.
 * @returns Assignments paired with deterministic keys for application and compact views.
 */
export const createActiveRoleItems = (
  assignments: ActiveAccessRoleAssignments,
): ActiveRoleItem[] => {
  const occurrences = new Map<string, number>();
  // A fixed JSON tuple avoids delimiter collisions and scope object property-order differences.
  return assignments.map((assignment) => {
    const { scope } = assignment;
    const identity = JSON.stringify([
      assignment.systemName,
      assignment.accessRoleName,
      assignment.assignmentType,
      assignment.activeToDate,
      scope ? [scope.type, scope.isGlobal, scope.values] : null,
    ]);
    const occurrence = occurrences.get(identity) ?? 0;
    occurrences.set(identity, occurrence + 1);
    return { assignment, key: `${identity}:${occurrence}` };
  });
};
