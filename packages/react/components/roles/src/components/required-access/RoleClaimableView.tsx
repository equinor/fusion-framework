import { useState, type ReactNode } from 'react';

import { Button, Card, Typography } from '@equinor/eds-core-react';
import type { RequiredRoleClaim, RequiredRoleStatus } from '@equinor/fusion-framework-module-roles';
import styled from 'styled-components';

import { RoleClaimDialog } from '../claim/RoleClaimDialog';

const Styled = {
  ClaimOptions: styled.div`
  display: grid;
  gap: 1rem;
`,

  ClaimCard: styled(Card)`
  border: 1px solid rgb(0 0 0 / 20%);
  border-radius: 0.25rem;
  box-shadow: 0 0.125rem 0.25rem rgb(0 0 0 / 12%);
`,
};

/** Eligible required-role outcomes and the app-scoped recovery mutation. */
interface RoleClaimableViewProps {
  readonly statuses: readonly RequiredRoleStatus[];
  readonly defaultReason: string;
  readonly claimingAssignmentId?: string;
  readonly onClaim: (assignmentId: string, reason: string, hours: number) => Promise<void>;
}

/**
 * Displays required roles that the signed-in account can claim.
 *
 * @param props - Resolved statuses, current claim state, and claim callback.
 * @returns The claimable-role outcome, or nothing when no required role is claimable.
 */
export const RoleClaimableView = ({
  statuses,
  defaultReason,
  claimingAssignmentId,
  onClaim,
}: RoleClaimableViewProps): ReactNode => {
  const [selectedClaim, setSelectedClaim] = useState<RequiredRoleClaim>();
  // Own the claimable classification so the parent can compose every outcome from one result set.
  const claimableRoles = statuses.filter((status) => status.claims.length > 0);
  // A mixed result set should only render sections for outcomes that are present.
  if (claimableRoles.length === 0) {
    return null;
  }

  // Keep each required access role associated with only the claimable roles that grant it.
  const roleSections = claimableRoles.map((status) => {
    // Separate cards make every equivalent claim path explicit to the user.
    const claimCards = status.claims.map((claim) => (
      <Styled.ClaimCard key={claim.assignmentId}>
        <Card.Header>
          <Card.HeaderTitle>
            <Typography variant="h4">{claim.displayName}</Typography>
          </Card.HeaderTitle>
        </Card.Header>
        <Card.Content>
          {claim.name !== claim.displayName && (
            <Typography>
              Role name: <code>{claim.name}</code>
            </Typography>
          )}
          <Typography>
            {claim.description ?? 'No description is available for this claimable role.'}
          </Typography>
          <Typography>
            You are eligible to claim this role. Click below to claim {claim.displayName}.
          </Typography>
        </Card.Content>
        <Card.Actions alignRight>
          <Button
            variant="contained"
            disabled={claimingAssignmentId !== undefined}
            onClick={() => setSelectedClaim(claim)}
          >
            Claim
          </Button>
        </Card.Actions>
      </Styled.ClaimCard>
    ));

    return (
      <section key={status.name}>
        <h3>
          You are currently missing activation of role <code>{status.name}</code>.
        </h3>
        <Styled.ClaimOptions>{claimCards}</Styled.ClaimOptions>
      </section>
    );
  });

  return (
    <>
      {roleSections}
      <RoleClaimDialog
        claim={selectedClaim}
        defaultReason={defaultReason}
        isClaiming={claimingAssignmentId === selectedClaim?.assignmentId}
        onClose={() => setSelectedClaim(undefined)}
        onClaim={onClaim}
      />
    </>
  );
};
