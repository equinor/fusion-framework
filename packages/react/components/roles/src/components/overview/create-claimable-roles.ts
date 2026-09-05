import type { ClaimableRoles } from '../../state/roles-state';
import type { ClaimableRoleDetails } from './role-details';

/**
 * Normalizes claimable assignments for both application cards and compact rows.
 * @param assignments - Consolidated assignments returned by the shared Roles provider.
 * @returns Addressable assignments with consistent display defaults.
 */
export const createClaimableRoles = (assignments: ClaimableRoles): ClaimableRoleDetails[] => {
  // Roles V2 makes IDs optional, but no activation control can address an assignment without one.
  const addressable = assignments.filter(
    (assignment): assignment is typeof assignment & { id: string } =>
      typeof assignment.id === 'string',
  );
  // Keep service defaults at the adaptation boundary rather than duplicating them across layouts.
  return addressable.map((assignment) => {
    const role = assignment.claimableRole;
    const displayName = role?.displayName ?? role?.name ?? 'Unknown role';
    return {
      assignmentId: assignment.id,
      displayName,
      name: role?.name ?? displayName,
      description: role?.description ?? 'No description is available.',
      reasons: assignment.reasons ?? [],
      isActive: Boolean(assignment.isActive),
      activeTo: assignment.activeTo,
      validFrom: assignment.validFrom,
      validTo: assignment.validTo,
      scope: assignment.scope,
    };
  });
};
