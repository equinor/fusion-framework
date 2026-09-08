import type { ConsolidatedRoleAssignments } from '../../state/roles-state';
import type { AssignedRoleDetails } from './role-details';

/**
 * Normalizes consolidated role assignments for application cards and compact rows.
 *
 * @remarks
 * Unlike claimable assignments, assigned assignments are never filtered by identifier: they are
 * read-only in every current layout, so an assignment missing `id` still needs a
 * stable key. Roles V2 makes `id` optional even on this consolidated, deduplicated collection.
 * @param assignments - Consolidated role assignments returned by the shared provider.
 * @returns Assigned assignments with consistent display defaults and a stable presentation key.
 */
export const createAssignedRoles = (
  assignments: ConsolidatedRoleAssignments,
): AssignedRoleDetails[] => {
  const occurrences = new Map<string, number>();
  // Every assignment needs a normalized display shape and a stable key, whether or not it has an id.
  return assignments.map((assignment) => {
    const role = assignment.role;
    const displayName = role?.displayName ?? role?.name ?? 'Unknown role';
    // Prefer the assignment identifier when present; otherwise synthesize a stable identity+occurrence
    // key from fields that describe this grant, mirroring `createActiveRoleItems` for records without IDs.
    let key: string;
    // Only a nonempty string identifier is a usable Roles V2 assignment ID.
    if (typeof assignment.id === 'string' && assignment.id.length > 0) {
      key = `assigned:${assignment.id}`;
    } else {
      const identity = JSON.stringify([
        role?.name,
        assignment.type,
        assignment.validFrom,
        assignment.validTo,
        assignment.scope
          ? [
              assignment.scope.isGlobal,
              assignment.scope.value,
              assignment.scope.scopeTypeIdentifier,
            ]
          : null,
      ]);
      const occurrence = occurrences.get(identity) ?? 0;
      occurrences.set(identity, occurrence + 1);
      key = `assigned:${identity}:${occurrence}`;
    }
    return {
      key,
      displayName,
      name: role?.name ?? displayName,
      description: role?.description ?? 'No description is available.',
      reasons: assignment.reasons ?? [],
      // Validity describes the assigned entitlement, not a claim activation.
      isActive: true,
      activeTo: null,
      validFrom: assignment.validFrom,
      validTo: assignment.validTo,
      scope: assignment.scope ?? null,
    };
  });
};
