import type { ReactNode } from 'react';
import styled from 'styled-components';

import type { ClaimableRoles as ClaimableRoleAssignments } from '@equinor/fusion-framework-react-components-roles';

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

interface ClaimableRolesProps {
  readonly roles: ClaimableRoleAssignments;
  readonly isClaiming: boolean;
  readonly error: unknown;
  readonly onClaim: (roleId: string) => Promise<void>;
}

/**
 * Displays claimable role assignments and their activation actions.
 *
 * @param props.roles - Claimable assignments returned by `useClaimableRoles`.
 * @param props.isClaiming - Whether an activation request is running.
 * @param props.error - Error from the latest activation request.
 * @param props.onClaim - Activates the selected assignment.
 * @returns The claimable-role section.
 */
export const ClaimableRoles = ({
  roles,
  isClaiming,
  error,
  onClaim,
}: ClaimableRolesProps): ReactNode => {
  const now = Date.now();
  // Recently expired assignments belong to the portal's compact reactivation experience.
  const availableRoles = roles.filter(
    (assignment) =>
      !assignment.isActive && (!assignment.activeTo || Date.parse(assignment.activeTo) > now),
  );
  // Each visible row retains the assignment id needed by the activation request.
  const items = availableRoles.map((assignment) => {
    const roleId = assignment.id;
    const label =
      assignment.claimableRole?.displayName ??
      assignment.claimableRole?.name ??
      assignment.claimableRole?.id ??
      'Unknown claimable role';
    return (
      <Styled.Row
        key={`${roleId}:${assignment.claimableRole?.id}:${assignment.validFrom}:${assignment.validTo}`}
      >
        <span>{label}</span>
        <button
          type="button"
          disabled={!roleId || isClaiming}
          onClick={() => roleId && void onClaim(roleId).catch(() => undefined)}
        >
          {isClaiming ? 'Claiming...' : 'Claim'}
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
