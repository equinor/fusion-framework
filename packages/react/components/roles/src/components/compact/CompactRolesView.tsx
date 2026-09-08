import { useMemo, useState, type ReactNode } from 'react';
import { Banner, CircularProgress, Tabs, Typography } from '@equinor/eds-core-react';
import styled from 'styled-components';

import { RoleClaimDialog } from '../claim/RoleClaimDialog';
import type { RoleDetails } from '../overview/role-details';
import { useRolesOverview } from '../overview/useRolesOverview';
import { RolesLoadFeedback } from '../overview/RolesLoadFeedback';
import { ClaimableRoleRow } from './ClaimableRoleRow';
import { CompactRoleRow } from './CompactRoleRow';
import { createCompactRoleGroups } from './create-compact-role-groups';
import { formatRoleDate } from './format-role-date';
import { RoleDetailsDialog } from './RoleDetailsDialog';

const Styled = {
  Content: styled.div`
    display: grid;
    gap: 1rem;
    padding: 1rem 0.5rem;
  `,
  RoleList: styled.div`
    display: grid;
  `,
  RoleSection: styled.section`
    display: grid;
    gap: 0.5rem;
  `,
};

/**
 * Displays role assignments, claimable role assignments, and effective access in a compact flyout.
 * Claimable switches collect audit details; information buttons reveal metadata without expanding rows.
 * @returns A compact role overview backed by the nearest `RolesProvider`.
 */
export const CompactRolesView = (): ReactNode => {
  const overview = useRolesOverview();
  const {
    activeAccessRoleAssignments,
    consolidatedClaimableRoleAssignments,
    claimableRoles,
    assignedRoles,
    selectedClaimableRoleAssignment,
    selectClaimableRoleAssignment,
  } = overview;
  const [tab, setTab] = useState(0);
  const [selectedDetails, setSelectedDetails] = useState<RoleDetails>();
  // One timestamp governs the whole partition; tab and dialog changes must not reshuffle shortcuts.
  const groups = useMemo(
    () =>
      createCompactRoleGroups(
        activeAccessRoleAssignments.assignments,
        claimableRoles,
        assignedRoles,
        Date.now(),
      ),
    [activeAccessRoleAssignments.assignments, claimableRoles, assignedRoles],
  );
  const rowControls = {
    isPending:
      consolidatedClaimableRoleAssignments.isActivating ||
      consolidatedClaimableRoleAssignments.isDeactivating,
    selectedAssignmentId: selectedClaimableRoleAssignment?.assignmentId,
    onShowInformation: setSelectedDetails,
    onSelectClaimableRoleAssignment: selectClaimableRoleAssignment,
    onDeactivate: overview.deactivateClaimableRoleAssignment,
  };
  // Keep each tab's policy in its variant; row presentation and audit interaction stay shared.
  const claimableItems = groups.available.map((role) => (
    <ClaimableRoleRow key={role.assignmentId} role={role} variant="available" {...rowControls} />
  ));
  const claimedItems = groups.claimed.map((role) => (
    <ClaimableRoleRow key={role.assignmentId} role={role} variant="claimed" {...rowControls} />
  ));
  const expiredItems = groups.expired.map((role) => (
    <ClaimableRoleRow key={role.assignmentId} role={role} variant="expired" {...rowControls} />
  ));
  // Effective access has no activation switch, but retains the same information affordance.
  const activeAccessItems = groups.activeAccess.map((role) => (
    <CompactRoleRow
      key={role.key}
      role={role}
      caption={`Active access${role.activeTo ? ` · Expires ${formatRoleDate(role.activeTo)}` : ''}`}
      onShowInformation={setSelectedDetails}
    />
  ));
  // A standing role assignment has no activation switch and is authoritative independent of
  // active access-role assignment data.
  const assignedItems = groups.assigned.map((role) => (
    <CompactRoleRow
      key={role.key}
      role={role}
      caption={`Role assignment${role.validTo ? ` · Valid until ${formatRoleDate(role.validTo)}` : ''}`}
      onShowInformation={setSelectedDetails}
    />
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
      {consolidatedClaimableRoleAssignments.deactivationError ? (
        <Banner>
          <Banner.Message>
            {String(consolidatedClaimableRoleAssignments.deactivationError)}
          </Banner.Message>
        </Banner>
      ) : null}
      <Tabs activeTab={tab} onChange={(index) => setTab(Number(index))}>
        <Tabs.List>
          <Tabs.Tab>Claimable</Tabs.Tab>
          <Tabs.Tab>Active</Tabs.Tab>
          <Tabs.Tab>Expired</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
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
          <Tabs.Panel>
            {activeAccessItems.length > 0 || claimedItems.length > 0 || assignedItems.length > 0 ? (
              <Styled.RoleList>
                {claimedItems.length > 0 ? (
                  <Styled.RoleSection>
                    <Typography variant="h5">Claimed roles</Typography>
                    {claimedItems}
                  </Styled.RoleSection>
                ) : null}
                {assignedItems.length > 0 ? (
                  <Styled.RoleSection>
                    <Typography variant="h5">Assigned roles</Typography>
                    {assignedItems}
                  </Styled.RoleSection>
                ) : null}
                {activeAccessItems.length > 0 ? (
                  <Styled.RoleSection>
                    <Typography variant="h5">Effective access</Typography>
                    {activeAccessItems}
                  </Styled.RoleSection>
                ) : null}
              </Styled.RoleList>
            ) : (
              <Typography>
                {overview.loadError
                  ? 'Your role assignments and effective access could not be fully loaded.'
                  : 'You have no assigned, claimed, or effective access'}
              </Typography>
            )}
          </Tabs.Panel>
          <Tabs.Panel>
            {expiredItems.length > 0 ? (
              <Styled.RoleList>{expiredItems}</Styled.RoleList>
            ) : (
              <Typography>
                {consolidatedClaimableRoleAssignments.error
                  ? 'Your claimable role assignments could not be loaded.'
                  : 'You have no recently expired claimed roles'}
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
      {selectedDetails ? (
        <RoleDetailsDialog role={selectedDetails} onClose={() => setSelectedDetails(undefined)} />
      ) : null}
    </Styled.Content>
  );
};
