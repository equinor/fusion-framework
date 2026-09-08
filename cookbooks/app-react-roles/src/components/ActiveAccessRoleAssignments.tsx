import type { ReactNode } from 'react';
import styled from 'styled-components';

import type { ActiveAccessRoleAssignments as ActiveRoleAssignments } from '@equinor/fusion-framework-react-components-roles';

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

interface ActiveAccessRoleAssignmentsProps {
  readonly assignments: ActiveRoleAssignments;
}

/**
 * Displays active access-role assignments for the current account.
 *
 * @param props.assignments - Active assignments returned by `useActiveAccessRoleAssignments`.
 * @returns The effective-access section.
 */
export const ActiveAccessRoleAssignments = ({
  assignments,
}: ActiveAccessRoleAssignmentsProps): ReactNode => {
  const occurrences = new Map<string, number>();
  // Active assignments have no ID: include the complete scope and count only identical rows.
  // JSON avoids delimiter collisions; unrelated insertions or reordering do not change keys.
  const items = assignments.map((assignment) => {
    const { scope } = assignment;
    const identity = JSON.stringify([
      assignment.systemName,
      assignment.accessRoleName,
      assignment.assignmentType,
      assignment.activeToDate,
      scope ? [scope.type, scope.isGlobal, scope.values] : null,
    ]);
    const occurrence = occurrences.get(identity) ?? 0;
    occurrences.set(identity, occurrence + 1);
    return (
      <li key={`${identity}:${occurrence}`}>
        {assignment.systemName ?? 'Unknown system'} / {assignment.accessRoleName ?? 'Unknown role'}
      </li>
    );
  });

  return (
    <Styled.Section>
      <h2>Effective access</h2>
      {items.length > 0 ? <Styled.List>{items}</Styled.List> : <p>No effective access.</p>}
    </Styled.Section>
  );
};
