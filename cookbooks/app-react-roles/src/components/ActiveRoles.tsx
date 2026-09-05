import type { ReactNode } from 'react';
import styled from 'styled-components';

import type { ActiveRoles as ActiveRoleAssignments } from '@equinor/fusion-framework-react-components-roles';

const Styled = {
  Section: styled.section`
    display: grid;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid #d5d5d5;
    border-radius: 0.5rem;
  `,
  List: styled.ul`
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding-left: 1.25rem;
  `,
};

interface ActiveRolesProps {
  readonly roles: ActiveRoleAssignments;
}

/**
 * Displays active access-role assignments for the current account.
 *
 * @param props.roles - Active assignments returned by `useRoles`.
 * @returns The active-role section.
 */
export const ActiveRoles = ({ roles }: ActiveRolesProps): ReactNode => {
  // Prepare role labels before markup so the section remains presentational.
  const items = roles.map((assignment) => (
    <li
      key={`${assignment.systemName}:${assignment.accessRoleName}:${assignment.assignmentType}:${assignment.activeToDate}`}
    >
      {assignment.systemName ?? 'Unknown system'} / {assignment.accessRoleName ?? 'Unknown role'}
    </li>
  ));

  return (
    <Styled.Section>
      <h2>Active roles</h2>
      {items.length > 0 ? <Styled.List>{items}</Styled.List> : <p>No active roles.</p>}
    </Styled.Section>
  );
};
