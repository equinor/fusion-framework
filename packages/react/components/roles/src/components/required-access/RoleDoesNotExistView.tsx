import type { ReactNode } from 'react';

import { List, Typography } from '@equinor/eds-core-react';
import type { RequiredAccessRoleStatus } from '@equinor/fusion-framework-module-roles';

/** Resolved requirements that may contain unregistered access-role names. */
interface RoleDoesNotExistViewProps {
  readonly statuses: readonly RequiredAccessRoleStatus[];
}

/**
 * Displays required access-role names that are not registered in Roles V2.
 *
 * @param props - Resolved required-access-role statuses.
 * @returns The unregistered-access-role outcome, or nothing when every access role exists.
 */
export const RoleDoesNotExistView = ({ statuses }: RoleDoesNotExistViewProps): ReactNode => {
  // Own the unregistered classification so the parent can compose every outcome from one result set.
  const missingAccessRoles = statuses.filter((status) => !status.exists);
  // A mixed result set should only render sections for outcomes that are present.
  if (missingAccessRoles.length === 0) {
    return null;
  }
  // Preserve the exact access-role names so maintainers can diagnose configuration mistakes.
  const roleItems = missingAccessRoles.map((status) => (
    <List.Item key={status.name}>{status.name}</List.Item>
  ));

  return (
    <section>
      <Typography group="heading" variant="h3">
        Access role does not exist
      </Typography>
      <Typography>These exact access-role names are not registered in Roles V2.</Typography>
      <List>{roleItems}</List>
    </section>
  );
};
