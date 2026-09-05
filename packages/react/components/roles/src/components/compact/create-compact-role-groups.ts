import type { ActiveRoles } from '../../state/roles-state';
import type { ClaimableRoleDetails, PermanentRoleDetails } from '../overview/role-details';
import { parseRoleDate } from '../../dates/parse-role-date';

const RECENT_ROLE_LIMIT = 3;
const RECENT_ROLE_WINDOW_MS = 7 * 24 * 60 * 60 * 1_000;

/** Collections shown by the compact Claimable, Active, and Expired tabs. */
interface CompactRoleGroups {
  readonly available: readonly ClaimableRoleDetails[];
  readonly claimed: readonly ClaimableRoleDetails[];
  readonly expired: readonly ClaimableRoleDetails[];
  readonly permanent: readonly PermanentRoleDetails[];
}

/**
 * Selects expired activations that still have a valid entitlement and can be claimed again.
 * @param role - Normalized claimable assignment.
 * @param now - Snapshot time shared by every eligibility check.
 * @returns Whether the role is eligible for a recent-expiry shortcut.
 */
const isRecentExpiredRole = (role: ClaimableRoleDetails, now: number): boolean => {
  const activeTo = parseRoleDate(role.activeTo);
  const validFrom = parseRoleDate(role.validFrom);
  const validTo = parseRoleDate(role.validTo);
  // Unknown entitlement bounds cannot establish eligibility for the recent-expiry shortcut.
  return (
    !role.isActive &&
    activeTo.status === 'valid' &&
    activeTo.timestamp <= now &&
    activeTo.timestamp >= now - RECENT_ROLE_WINDOW_MS &&
    (validFrom.status === 'missing' ||
      (validFrom.status === 'valid' && validFrom.timestamp <= now)) &&
    (validTo.status === 'missing' || (validTo.status === 'valid' && validTo.timestamp > now))
  );
};

/**
 * Derives compact tabs from one snapshot without losing assignments beyond the shortcut limit.
 * @param active - Active access-role assignments.
 * @param claimable - Normalized claimable assignments.
 * @param now - Snapshot timestamp; supplied explicitly for deterministic expiry classification.
 * @returns Bounded expiry shortcuts, remaining claimable roles, and both kinds of active role.
 */
export const createCompactRoleGroups = (
  active: ActiveRoles,
  claimable: readonly ClaimableRoleDetails[],
  now: number,
): CompactRoleGroups => {
  // Partition only the bounded shortcut set out of Claimable; older eligible assignments remain reachable.
  const expired = claimable
    .filter((role) => isRecentExpiredRole(role, now))
    .sort((left, right) => {
      const leftDate = parseRoleDate(left.activeTo);
      const rightDate = parseRoleDate(right.activeTo);
      // Eligibility already excluded invalid dates; narrow again instead of asserting metadata.
      return leftDate.status === 'valid' && rightDate.status === 'valid'
        ? rightDate.timestamp - leftDate.timestamp
        : 0;
    })
    .slice(0, RECENT_ROLE_LIMIT);

  // Claimed activations use their richer consolidated metadata, not duplicate access-role rows.
  const permanentAssignments = active.filter(
    (assignment) => assignment.assignmentType?.toLowerCase() !== 'claimable',
  );
  // Preserve source, scope, and expiry when adapting permanent access to the same information dialog.
  const permanent = permanentAssignments.map((assignment): PermanentRoleDetails => {
    const displayName = assignment.accessRoleName ?? 'Unknown access role';
    return {
      key: `${assignment.systemName}:${assignment.accessRoleName}:${assignment.assignmentType}:${assignment.activeToDate}`,
      displayName,
      name: displayName,
      description: `Access role in ${assignment.systemName ?? 'an unknown system'}.`,
      reasons: [
        assignment.assignmentType
          ? `Assigned as ${assignment.assignmentType}`
          : 'Assignment type was not provided',
      ],
      validTo: assignment.activeToDate,
      scope: assignment.scope
        ? {
            isGlobal: Boolean(assignment.scope.isGlobal),
            value: assignment.scope.values?.join(', ') ?? null,
            scopeTypeIdentifier: assignment.scope.type,
          }
        : null,
      activeTo: assignment.activeToDate,
      isActive: true,
    };
  });

  // Keep assignments beyond the shortcut limit reachable for activation.
  const available = claimable.filter((role) => !expired.includes(role));
  // Active is informational; these assignments intentionally also remain in Claimable.
  const claimed = claimable.filter((role) => role.isActive);
  return { available, claimed, expired, permanent };
};
