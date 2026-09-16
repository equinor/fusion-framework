import { useState, type ReactNode } from 'react';

import { Button, Card, Typography } from '@equinor/eds-core-react';
import type {
  RequiredAccessRoleClaimableAssignment,
  RequiredAccessRoleStatus,
} from '@equinor/fusion-framework-module-roles';
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

/** Eligible required-access-role outcomes and the app-scoped recovery mutation. */
interface RoleClaimableViewProps {
  readonly statuses: readonly RequiredAccessRoleStatus[];
  readonly defaultReason: string;
  readonly activatingAssignmentId?: string;
  readonly onActivate: (assignmentId: string, reason: string, hours: number) => Promise<void>;
}

/**
 * Displays required access roles the signed-in account can obtain by claiming a role assignment.
 *
 * @param props - Resolved statuses, current activation state, and activation callback.
 * @returns The claimable outcome, or nothing when no required access role is claimable.
 */
export const RoleClaimableView = ({
  statuses,
  defaultReason,
  activatingAssignmentId,
  onActivate,
}: RoleClaimableViewProps): ReactNode => {
  const [selectedClaimableRoleAssignment, setSelectedClaimableRoleAssignment] =
    useState<RequiredAccessRoleClaimableAssignment>();
  // Own the claimable classification so the parent can compose every outcome from one result set.
  const claimableStatuses = statuses.filter((status) => status.claimableAssignments.length > 0);
  // A mixed result set should only render sections for outcomes that are present.
  if (claimableStatuses.length === 0) {
    return null;
  }

  // Keep each required access role associated with only the claimable roles that grant it.
  const roleSections = claimableStatuses.map((status) => {
    const uniqueAssignmentsByName = new Map<string, RequiredAccessRoleClaimableAssignment>();
    // Several assignments can grant the same claimable role, but the recovery choice is the role.
    for (const claimableAssignment of status.claimableAssignments) {
      // Preserve the first eligible assignment returned for each claimable role.
      if (!uniqueAssignmentsByName.has(claimableAssignment.name)) {
        uniqueAssignmentsByName.set(claimableAssignment.name, claimableAssignment);
      }
    }
    const uniqueAssignments = [...uniqueAssignmentsByName.values()];
    // Separate cards keep genuinely different claimable roles explicit to the user.
    const claimCards = uniqueAssignments.map((claimableAssignment) => (
      <Styled.ClaimCard key={claimableAssignment.assignmentId}>
        <Card.Header>
          <Card.HeaderTitle>
            <Typography variant="h4">{claimableAssignment.displayName}</Typography>
          </Card.HeaderTitle>
        </Card.Header>
        <Card.Content>
          {claimableAssignment.name !== claimableAssignment.displayName && (
            <Typography>
              Role name: <code>{claimableAssignment.name}</code>
            </Typography>
          )}
          <Typography>
            {claimableAssignment.description ??
              'No description is available for this claimable role.'}
          </Typography>
          <Typography>
            You are eligible to claim this role. Click below to claim{' '}
            {claimableAssignment.displayName}.
          </Typography>
        </Card.Content>
        <Card.Actions alignRight>
          <Button
            variant="contained"
            disabled={activatingAssignmentId !== undefined}
            onClick={() => setSelectedClaimableRoleAssignment(claimableAssignment)}
          >
            Claim
          </Button>
        </Card.Actions>
      </Styled.ClaimCard>
    ));

    return (
      <section key={status.name}>
        <Typography group="heading" variant="h3">
          You are currently missing activation of role <code>{status.name}</code>.
        </Typography>
        <Styled.ClaimOptions>{claimCards}</Styled.ClaimOptions>
      </section>
    );
  });

  return (
    <>
      {roleSections}
      <RoleClaimDialog
        claimableRoleAssignment={selectedClaimableRoleAssignment}
        defaultReason={defaultReason}
        isActivating={activatingAssignmentId === selectedClaimableRoleAssignment?.assignmentId}
        onClose={() => setSelectedClaimableRoleAssignment(undefined)}
        onActivate={onActivate}
      />
    </>
  );
};
