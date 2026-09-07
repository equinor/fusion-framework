import type { ReactNode } from 'react';

import { List, Typography } from '@equinor/eds-core-react';
import type { RequiredRoleStatus } from '@equinor/fusion-framework-module-roles';

/** Resolved requirements that may contain unregistered access-role names. */
interface RoleDoesNotExistViewProps {
  readonly statuses: readonly RequiredRoleStatus[];
}

/**
 * Displays required access-role names that are not registered in Roles V2.
 *
 * @param props - Resolved required-role statuses.
 * @returns The missing-role outcome, or nothing when every role exists.
 */
export const RoleDoesNotExistView = ({ statuses }: RoleDoesNotExistViewProps): ReactNode => {
  // Own the missing-role classification so the parent can compose every outcome from one result set.
  const missingRoles = statuses.filter((status) => !status.exists);
  // A mixed result set should only render sections for outcomes that are present.
  if (missingRoles.length === 0) {
    return null;
  }
  // Preserve the exact role names so maintainers can diagnose configuration mistakes.
  const roleItems = missingRoles.map((status) => (
    <List.Item key={status.name}>{status.name}</List.Item>
  ));

  return (
    <section>
      <Typography group="heading" variant="h3">
        Role does not exist
      </Typography>
      <Typography>These exact access-role names are not registered in Roles V2.</Typography>
      <List>{roleItems}</List>
    </section>
  );
};
