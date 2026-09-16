import { parseRoleDate } from '../../dates/parse-role-date';
import type { AssignedRoleDetails } from './role-details';

/**
 * Selects assigned role assignments that are currently within their effective window.
 *
 * `/consolidated-role-assignments` carries no `isActive` flag, so consumers must derive current
 * effectiveness from the assignment validity bounds. Malformed bounds exclude the assignment
 * defensively rather than presenting access that may no longer apply.
 *
 * @param roles - Normalized assigned role assignments.
 * @param now - Snapshot time shared by every effectiveness check.
 * @returns Assigned role assignments effective at the supplied time.
 */
export const filterEffectiveAssignedRoles = (
  roles: readonly AssignedRoleDetails[],
  now: number,
): readonly AssignedRoleDetails[] => {
  // Exclude uncertain or ineffective grants rather than presenting access the account may not hold.
  return roles.filter((role) => {
    const validFrom = parseRoleDate(role.validFrom);
    const validTo = parseRoleDate(role.validTo);
    return (
      (validFrom.status === 'missing' ||
        (validFrom.status === 'valid' && validFrom.timestamp <= now)) &&
      (validTo.status === 'missing' || (validTo.status === 'valid' && validTo.timestamp > now))
    );
  });
};
