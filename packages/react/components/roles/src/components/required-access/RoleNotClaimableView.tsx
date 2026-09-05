import type { ReactNode } from 'react';

import type { RequiredRoleStatus } from '@equinor/fusion-framework-module-roles';

/** Resolved requirements that may lack an eligible claimable assignment. */
interface RoleNotClaimableViewProps {
  readonly statuses: readonly RequiredRoleStatus[];
}

/**
 * Displays existing required roles that the signed-in account cannot claim.
 *
 * @param props - Resolved required-role statuses.
 * @returns The non-claimable outcome, or nothing when every existing role is claimable.
 */
export const RoleNotClaimableView = ({ statuses }: RoleNotClaimableViewProps): ReactNode => {
  // Own the unavailable classification so the parent can compose every outcome from one result set.
  const unavailableRoles = statuses.filter((status) => status.exists && status.claims.length === 0);
  // A mixed result set should only render sections for outcomes that are present.
  if (unavailableRoles.length === 0) {
    return null;
  }
  // Descriptions help users identify which access they need to request from an administrator.
  const roleItems = unavailableRoles.map((status) => (
    <li key={status.name}>
      <strong>{status.name}</strong>
      {status.description ? <p>{status.description}</p> : null}
    </li>
  ));

  return (
    <section>
      <h3>Role is not claimable</h3>
      <p>The roles exist, but your account has no claimable assignment that grants them.</p>
      <ul>{roleItems}</ul>
    </section>
  );
};
