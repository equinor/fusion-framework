import { useState, type ReactNode } from 'react';
import { Banner, Button, CircularProgress, Tabs, Typography } from '@equinor/eds-core-react';
import styled from 'styled-components';

import { RoleClaimDialog } from '../claim/RoleClaimDialog';
import { useRolesOverview } from '../overview/useRolesOverview';
import { RolesLoadFeedback } from '../overview/RolesLoadFeedback';
import { createActiveRoleItems } from '../overview/create-active-role-items';
import { filterEffectiveAssignedRoles } from '../overview/filter-effective-assigned-roles';
import { RoleAssignmentCard } from './RoleAssignmentCard';

const Styled = {
  Content: styled.div`
    display: grid;
    gap: 1rem;
  `,
  RoleList: styled.div`
    display: grid;
    gap: 0.75rem;
  `,
  RoleSection: styled.section`
    display: grid;
    gap: 0.75rem;
  `,
};

/**
 * Displays application-sized assignment cards using the shared role overview controller.
 * @returns Active and Claimable tabs, collection retry states, and the audit dialog.
 */
export const RolesApplicationView = (): ReactNode => {
  const overview = useRolesOverview();
  const {
    activeAccessRoleAssignments,
    consolidatedClaimableRoleAssignments,
    assignedRoles,
    selectedClaimableRoleAssignment,
    selectClaimableRoleAssignment,
  } = overview;
  const [tab, setTab] = useState(0);
  // Application cards retain every active access-role assignment, including activated claims.
  const activeItems = createActiveRoleItems(activeAccessRoleAssignments.assignments).map(
    ({ assignment, key }) => (
      <RoleAssignmentCard
        key={key}
        title={assignment.accessRoleName ?? 'Unknown access role'}
        description={assignment.systemName ?? 'Unknown system'}
      />
    ),
  );
  // Assigned roles are shown separately because active access does not identify assignment provenance.
  const assignedItems = filterEffectiveAssignedRoles(assignedRoles, Date.now()).map((role) => (
    <RoleAssignmentCard key={role.key} title={role.displayName} description={role.description} />
  ));
  // Normalization removes unaddressable assignments before offering activation controls.
  const claimableItems = overview.claimableRoles.map((role) => (
    <RoleAssignmentCard
      key={role.assignmentId}
      title={role.displayName}
      description={role.description}
    >
      <Button
        variant="contained"
        disabled={consolidatedClaimableRoleAssignments.isActivating || role.isActive}
        onClick={() => selectClaimableRoleAssignment(role)}
      >
        {role.isActive ? 'Active' : 'Claim'}
      </Button>
    </RoleAssignmentCard>
  ));

  // Only first-load progress may replace the view; background reads must retain audit forms.
  if (overview.isLoading) {
    return <CircularProgress aria-label="Loading role assignments" />;
  }
  return (
    <Styled.Content>
      <RolesLoadFeedback
        isRefreshing={overview.isRefreshing}
        error={overview.loadError}
        onRetry={overview.reload}
      />
      {consolidatedClaimableRoleAssignments.activationError ? (
        <Banner>
          <Banner.Message>
            {String(consolidatedClaimableRoleAssignments.activationError)}
          </Banner.Message>
        </Banner>
      ) : null}
      <Tabs activeTab={tab} onChange={(index) => setTab(Number(index))}>
        <Tabs.List>
          <Tabs.Tab>Active</Tabs.Tab>
          <Tabs.Tab>Claimable</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel>
            {activeItems.length > 0 || assignedItems.length > 0 ? (
              <Styled.RoleList>
                {assignedItems.length > 0 ? (
                  <Styled.RoleSection>
                    <Typography variant="h5">Assigned roles</Typography>
                    {assignedItems}
                  </Styled.RoleSection>
                ) : null}
                {activeItems.length > 0 ? (
                  <Styled.RoleSection>
                    <Typography variant="h5">Effective access</Typography>
                    {activeItems}
                  </Styled.RoleSection>
                ) : null}
              </Styled.RoleList>
            ) : (
              <Typography>
                {overview.loadError
                  ? 'Your role assignments and effective access could not be loaded.'
                  : 'You have no assigned roles or effective access'}
              </Typography>
            )}
          </Tabs.Panel>
          <Tabs.Panel>
            {claimableItems.length > 0 ? (
              <Styled.RoleList>{claimableItems}</Styled.RoleList>
            ) : (
              <Typography>
                {consolidatedClaimableRoleAssignments.error
                  ? 'Your claimable role assignments could not be loaded.'
                  : 'You have no roles to claim'}
              </Typography>
            )}
          </Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
      <RoleClaimDialog
        claimableRoleAssignment={selectedClaimableRoleAssignment}
        defaultReason=""
        isActivating={consolidatedClaimableRoleAssignments.isActivating}
        onClose={() => selectClaimableRoleAssignment(undefined)}
        onActivate={overview.activateClaimableRoleAssignment}
      />
    </Styled.Content>
  );
};
