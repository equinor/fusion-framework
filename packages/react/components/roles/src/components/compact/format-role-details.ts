import type { RoleDetails } from '../overview/role-details';
import { formatRoleDate } from './format-role-date';
import { parseRoleDate } from '../../dates/parse-role-date';

/** Prepared metadata labels for the compact information dialog. */
interface RoleDetailsLabels {
  readonly validUntil: string;
  readonly scope: string;
  readonly activation: string;
}

/**
 * Gives global and missing scopes meaningful labels rather than exposing empty service values.
 * @param scope - Optional assignment scope.
 * @returns A human-readable scope description.
 */
const formatScope = (scope: RoleDetails['scope']): string => {
  // Missing metadata and explicit global scope are distinct service representations.
  if (!scope) {
    return 'No scopes';
  }
  // Explicit global access is more informative than its typically empty scope value.
  if (scope.isGlobal) {
    return 'Global';
  }
  return scope.scopeTypeIdentifier && scope.value
    ? `${scope.scopeTypeIdentifier}: ${scope.value}`
    : (scope.value ?? scope.scopeTypeIdentifier ?? 'No scopes');
};

/**
 * Derives information-dialog labels without embedding expiry decisions in JSX.
 * @param role - Normalized assignment metadata.
 * @param now - Snapshot timestamp used to classify inactive expirations.
 * @returns Localized validity, scope, and activation labels.
 */
export const formatRoleDetails = (role: RoleDetails, now: number): RoleDetailsLabels => {
  const activeTo = parseRoleDate(role.activeTo);
  const activation = role.isActive
    ? activeTo.status === 'valid'
      ? `Active until ${formatRoleDate(role.activeTo)}`
      : activeTo.status === 'invalid'
        ? 'Active · Invalid expiration date'
        : 'Active'
    : activeTo.status === 'invalid'
      ? 'Invalid expiration date'
      : activeTo.status === 'valid' && activeTo.timestamp <= now
        ? `Expired ${formatRoleDate(role.activeTo)}`
        : 'Available to activate';
  return {
    validUntil: formatRoleDate(role.validTo),
    scope: formatScope(role.scope),
    activation,
  };
};
