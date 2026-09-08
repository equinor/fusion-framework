import type { ReactNode } from 'react';

import { List, Typography } from '@equinor/eds-core-react';
import type { RequiredAccessRoleStatus } from '@equinor/fusion-framework-module-roles';

/** Resolved requirements that may lack an eligible claimable role assignment. */
interface RoleNotClaimableViewProps {
  readonly statuses: readonly RequiredAccessRoleStatus[];
}

/**
 * Displays registered required access roles that the signed-in account cannot claim.
 *
 * @param props - Resolved required-access-role statuses.
 * @returns The non-claimable outcome, or nothing when every registered access role is claimable.
 */
export const RoleNotClaimableView = ({ statuses }: RoleNotClaimableViewProps): ReactNode => {
  // Own the unavailable classification so the parent can compose every outcome from one result set.
  const unavailableRoles = statuses.filter(
    (status) => status.exists && status.claimableAssignments.length === 0,
  );
  // A mixed result set should only render sections for outcomes that are present.
  if (unavailableRoles.length === 0) {
    return null;
  }
  // Descriptions help users identify which access they need to request from an administrator.
  const roleItems = unavailableRoles.map((status) => (
    <List.Item key={status.name}>
      <Typography variant="body_short_bold">{status.name}</Typography>
      {status.description ? <Typography>{status.description}</Typography> : null}
    </List.Item>
  ));

  return (
    <section>
      <Typography group="heading" variant="h3">
        Access role is not claimable
      </Typography>
      <Typography>
        These access roles exist, but your account has no claimable role assignment that grants
        them.
      </Typography>
      <List>{roleItems}</List>
    </section>
  );
};
