import type { ReactNode } from 'react';
import styled from 'styled-components';

import type { ConsolidatedClaimableRoleAssignments as ClaimableRoleAssignments } from '@equinor/fusion-framework-react-components-roles';

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
  Row: styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  `,
  Error: styled.p`
    color: #b30d2f;
  `,
};

interface ConsolidatedClaimableRoleAssignmentsProps {
  readonly assignments: ClaimableRoleAssignments;
  readonly isActivating: boolean;
  readonly error: unknown;
  readonly onActivate: (assignmentId: string) => Promise<void>;
}

/**
 * Displays claimable role assignments and their activation actions.
 *
 * @param props.assignments - Assignments returned by `useClaimableRoleAssignments`.
 * @param props.isActivating - Whether an activation request is running.
 * @param props.error - Error from the latest activation request.
 * @param props.onActivate - Activates the selected assignment.
 * @returns The claimable-role section.
 */
export const ConsolidatedClaimableRoleAssignments = ({
  assignments,
  isActivating,
  error,
  onActivate,
}: ConsolidatedClaimableRoleAssignmentsProps): ReactNode => {
  // A completed activation does not remove the underlying claimable entitlement.
  const availableRoles = assignments.filter((assignment) => !assignment.isActive);
  // Each visible row retains the assignment id needed by the activation request.
  const items = availableRoles.map((assignment) => {
    const assignmentId = assignment.id;
    const label =
      assignment.claimableRole?.displayName ??
      assignment.claimableRole?.name ??
      assignment.claimableRole?.id ??
      'Unknown claimable role';
    return (
      <Styled.Row
        key={`${assignmentId}:${assignment.claimableRole?.id}:${assignment.validFrom}:${assignment.validTo}`}
      >
        <span>{label}</span>
        <button
          type="button"
          disabled={!assignmentId || isActivating}
          onClick={() => assignmentId && void onActivate(assignmentId).catch(() => undefined)}
        >
          {isActivating ? 'Claiming...' : 'Claim'}
        </button>
      </Styled.Row>
    );
  });

  return (
    <Styled.Section>
      <h2>Claimable roles</h2>
      {error ? <Styled.Error>{String(error)}</Styled.Error> : null}
      {items.length > 0 ? <Styled.List>{items}</Styled.List> : <p>No claimable roles.</p>}
    </Styled.Section>
  );
};
