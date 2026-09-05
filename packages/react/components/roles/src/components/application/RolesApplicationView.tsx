import { useState, type ReactNode } from 'react';
import { Banner, Button, CircularProgress, Tabs, Typography } from '@equinor/eds-core-react';
import styled from 'styled-components';

import { RoleClaimDialog } from '../claim/RoleClaimDialog';
import { useRolesOverview } from '../overview/useRolesOverview';
import { RolesLoadFeedback } from '../overview/RolesLoadFeedback';
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
};

/**
 * Displays application-sized assignment cards using the shared role overview controller.
 * @returns Active and Claimable tabs, collection retry states, and the audit dialog.
 */
export const RolesApplicationView = (): ReactNode => {
  const overview = useRolesOverview();
  const { active, claimable, selectedClaim, selectClaim } = overview;
  const [tab, setTab] = useState(0);
  // Application cards retain every active access-role assignment, including claimable activations.
  const activeItems = active.roles.map((assignment) => (
    <RoleAssignmentCard
      key={`${assignment.systemName}:${assignment.accessRoleName}:${assignment.assignmentType}:${assignment.activeToDate}`}
      title={assignment.accessRoleName ?? 'Unknown access role'}
      description={assignment.systemName ?? 'Unknown system'}
    />
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
        disabled={claimable.isClaiming || role.isActive}
        onClick={() => selectClaim(role)}
      >
        {role.isActive ? 'Active' : 'Claim'}
      </Button>
    </RoleAssignmentCard>
  ));

  // Only first-load progress may replace the view; background reads must retain audit forms.
  if (overview.isLoading) {
    return <CircularProgress aria-label="Loading roles" />;
  }
  return (
    <Styled.Content>
      <RolesLoadFeedback
        isRefreshing={overview.isRefreshing}
        error={overview.loadError}
        onRetry={overview.reload}
      />
      {claimable.claimError ? (
        <Banner>
          <Banner.Message>{String(claimable.claimError)}</Banner.Message>
        </Banner>
      ) : null}
      <Tabs activeTab={tab} onChange={(index) => setTab(Number(index))}>
        <Tabs.List>
          <Tabs.Tab>Active</Tabs.Tab>
          <Tabs.Tab>Claimable</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel>
            {activeItems.length > 0 ? (
              <Styled.RoleList>{activeItems}</Styled.RoleList>
            ) : (
              <Typography>
                {active.error ? 'Active roles could not be loaded.' : 'You have no active roles'}
              </Typography>
            )}
          </Tabs.Panel>
          <Tabs.Panel>
            {claimableItems.length > 0 ? (
              <Styled.RoleList>{claimableItems}</Styled.RoleList>
            ) : (
              <Typography>
                {claimable.error
                  ? 'Claimable roles could not be loaded.'
                  : 'You have no available roles'}
              </Typography>
            )}
          </Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
      <RoleClaimDialog
        claim={selectedClaim}
        defaultReason=""
        isClaiming={claimable.isClaiming}
        onClose={() => selectClaim(undefined)}
        onClaim={overview.claimRole}
      />
    </Styled.Content>
  );
};
